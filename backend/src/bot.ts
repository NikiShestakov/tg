
import TelegramBot from 'node-telegram-bot-api';
import { parseUserProfile } from './services/geminiService';
import { createProfile } from './services/database';
import { ProfileData } from './types';

// Sanitize the token to remove ANY whitespace characters (spaces, newlines, tabs) from anywhere in the string.
const rawToken = process.env.TELEGRAM_BOT_TOKEN?.replace(/\s/g, '');

if (!rawToken) {
  throw new Error('TELEGRAM_BOT_TOKEN is not set in environment variables');
}

// Final safeguard: encode the token to handle any special characters that might cause URL issues.
const token = encodeURI(rawToken);

// For debugging: log the token that is being used, masking most of it for security.
console.log(`Using sanitized token: ${token.substring(0, 10)}...`);

// User session state to buffer messages and media
interface UserSession {
    messages: string[];
    photoFileIds: string[];
    videoFileIds: string[];
    timer: NodeJS.Timeout;
}
const userSessions = new Map<number, UserSession>();
const SESSION_TIMEOUT = 3 * 60 * 1000; // 3 minutes

export const startBot = () => {
  const bot = new TelegramBot(token, { polling: true });

  console.log('Telegram bot started...');

  bot.on('polling_error', (error) => {
    console.error('Polling error:', error.message);
    // You can add more specific handling here if needed
  });

  bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(
      chatId,
      'Привет! Я бот для сбора анкет. Отправьте мне информацию о себе: имя, возраст, рост, вес, параметры, и расскажите немного о себе. Вы можете прислать всё в одном или нескольких сообщениях, а также прикрепить фото и видео. Я подожду 3 минуты после вашего последнего сообщения и затем обработаю анкету.'
    );
  });

  bot.on('message', async (msg) => {
    // Ignore commands
    if (msg.text && msg.text.startsWith('/')) {
      return;
    }

    const chatId = msg.chat.id;
    const userId = msg.from?.id;
    const username = msg.from?.username || 'unknown';

    if (!userId) return;

    // Get or create a session for the user
    let session = userSessions.get(userId);

    if (session) {
      // Clear the existing timer because a new message has arrived
      clearTimeout(session.timer);
    } else {
      // Create a new session
      session = { messages: [], photoFileIds: [], videoFileIds: [], timer: {} as NodeJS.Timeout };
      userSessions.set(userId, session);
    }
    
    // Add message text or collect media file_ids
    if (msg.text) {
        session.messages.push(msg.text);
    }
    if (msg.photo) {
        // Get the highest resolution photo
        const photo = msg.photo[msg.photo.length - 1];
        session.photoFileIds.push(photo.file_id);
    }
    if (msg.video) {
        session.videoFileIds.push(msg.video.file_id);
    }

    // Set a new timer to process the collected messages
    session.timer = setTimeout(async () => {
        const currentSession = userSessions.get(userId);
        if (!currentSession) return; // Session might have been cleared already

        // Ensure there is content to process
        if (currentSession.messages.length === 0 && currentSession.photoFileIds.length === 0 && currentSession.videoFileIds.length === 0) {
            userSessions.delete(userId); // Clean up empty session
            return;
        }

        bot.sendMessage(chatId, 'Обрабатываю вашу анкету...');
        
        // Add placeholders to text for AI context
        const textForAI = [...currentSession.messages];
        if (currentSession.photoFileIds.length > 0) textForAI.push('[ФОТО ПРИКРЕПЛЕНО]');
        if (currentSession.videoFileIds.length > 0) textForAI.push('[ВИДЕО ПРИКРЕПЛЕНО]');
        const fullText = textForAI.join('\n\n');
        
        try {
            // Get URLs for all collected photos and videos in parallel
            const photoUrlPromises = currentSession.photoFileIds.map(fileId => bot.getFileLink(fileId));
            const videoUrlPromises = currentSession.videoFileIds.map(fileId => bot.getFileLink(fileId));
            
            const photoUrls = await Promise.all(photoUrlPromises);
            const videoUrls = await Promise.all(videoUrlPromises);
            
            const parsedData = await parseUserProfile(fullText);

            const profileToSave: ProfileData = {
                ...parsedData,
                username,
                photoUrl: photoUrls.length > 0 ? photoUrls : null,
                videoUrl: videoUrls.length > 0 ? videoUrls : null,
            };
            
            await createProfile(profileToSave);
            bot.sendMessage(chatId, 'Спасибо! Ваша анкета принята и сохранена.');

        } catch (error) {
            console.error('Error processing profile for user', userId, error);
            bot.sendMessage(chatId, 'Произошла ошибка при обработке вашей анкеты. Попробуйте еще раз.');
        } finally {
            // Clear the session for this user
            userSessions.delete(userId);
        }

    }, SESSION_TIMEOUT);
  });
};
