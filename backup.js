const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');
const { authenticate } = require('@google-cloud/local-auth');
const { app } = require('electron');

const userDataPath = app.getPath('userData');
const dbPath = path.resolve(userDataPath, 'database.db');
const settingsPath = path.join(userDataPath, 'settings.json');
const lastBackupInfoPath = path.join(userDataPath, 'last-backup-info.json');
const tokenPath = path.join(userDataPath, 'token.json'); // 用于存储授权令牌的文件路径

// 加载用户设置
function loadSettings() {
  try {
    if (fs.existsSync(settingsPath)) {
      const data = fs.readFileSync(settingsPath);
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Failed to load settings:', err);
  }
  return { enableBackup: false }; // 默认设置
}

// 保存用户设置
function saveSettings(settings) {
  try {
    fs.writeFileSync(settingsPath, JSON.stringify(settings));
    console.log('Settings saved:', settings);
  } catch (err) {
    console.error('Failed to save settings:', err);
  }
}

// 检查数据库是否有更改
function hasDatabaseChanged() {
  if (!fs.existsSync(dbPath)) {
    console.log("Database file not found.");
    return false;
  }

  const lastModifiedTime = fs.statSync(dbPath).mtimeMs;
  let lastBackupTime = 0;

  if (fs.existsSync(lastBackupInfoPath)) {
    const lastBackupInfo = JSON.parse(fs.readFileSync(lastBackupInfoPath));
    lastBackupTime = lastBackupInfo.lastBackupTime || 0;
  }

  return lastModifiedTime > lastBackupTime;
}

// 获取 OAuth2 客户端
async function authenticateUser() {
  let auth;
  try {
    if (fs.existsSync(tokenPath)) {
      // 如果 token 文件存在，则从文件中加载 token
      const token = JSON.parse(fs.readFileSync(tokenPath));
      auth = new google.auth.OAuth2();
      auth.setCredentials(token);
    } else {
      // 否则，进行用户授权
      auth = await authenticate({
        keyfilePath: path.join(__dirname, 'credentials.json'),
        scopes: ['https://www.googleapis.com/auth/drive.file'],
      });

      // 将 token 保存到本地
      const token = auth.credentials;
      fs.writeFileSync(tokenPath, JSON.stringify(token));
    }
    return auth;
  } catch (err) {
    console.error('Failed to authenticate user:', err);
    throw err;
  }
}

// 查找或创建 BdErpBackup 文件夹
async function findOrCreateBackupFolder(drive) {
  const folderName = 'BdErpBackup';
  let folderId = null;

  try {
    const response = await drive.files.list({
      q: `mimeType='application/vnd.google-apps.folder' and name='${folderName}' and trashed=false`,
      fields: 'files(id, name)',
    });

    const folders = response.data.files;
    if (folders.length > 0) {
      folderId = folders[0].id;
      console.log(`Found folder ${folderName} with ID: ${folderId}`);
    } else {
      const fileMetadata = {
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
      };

      const folder = await drive.files.create({
        resource: fileMetadata,
        fields: 'id',
      });

      folderId = folder.data.id;
      console.log(`Created folder ${folderName} with ID: ${folderId}`);
    }
  } catch (err) {
    console.error('Error finding or creating backup folder:', err);
    throw err;
  }

  return folderId;
}

// 上传文件到 Google 云端硬盘
async function uploadFileToDrive(auth, filePath) {
  const drive = google.drive({ version: 'v3', auth });

  const folderId = await findOrCreateBackupFolder(drive);

  const dateFormatter = new Intl.DateTimeFormat('zh-TW', {
    timeZone: 'Asia/Taipei',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const formattedDateParts = dateFormatter.formatToParts(new Date());
  const formattedDate = formattedDateParts.map(({ type, value }) => {
    if (type === 'year') return value;
    if (type === 'month' || type === 'day' || type === 'hour' || type === 'minute' || type === 'second') return value.padStart(2, '0');
    return '';
  }).join('');

  const fileMetadata = {
    name: `database-backup-${formattedDate}.db`,
    parents: [folderId],
  };

  const media = {
    mimeType: 'application/x-sqlite3',
    body: fs.createReadStream(filePath),
  };

  try {
    const file = await drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: 'id',
    });
    console.log('File Id:', file.data.id);

    const backupInfo = { lastBackupTime: fs.statSync(filePath).mtimeMs };
    fs.writeFileSync(lastBackupInfoPath, JSON.stringify(backupInfo));
  } catch (err) {
    console.error('Error uploading file:', err);
    throw err;
  }
}

// 备份数据库的逻辑
async function backupDatabase(force = false) {
  const settings = loadSettings();
  if (!settings.enableBackup) {
    console.log("Backup is not enabled.");
    return;
  }

  if (force || hasDatabaseChanged()) {
    console.log("Database has changes. Proceeding to backup...");
    try {
      const auth = await authenticateUser();
      await uploadFileToDrive(auth, dbPath);
      console.log("Database backed up to Google Drive successfully.");
    } catch (err) {
      console.error("Error backing up database to Google Drive:", err);
    }
  } else {
    console.log("No changes in the database. No backup needed.");
  }
}

// 导出函数
module.exports = {
  loadSettings,
  saveSettings,
  backupDatabase,
  hasDatabaseChanged
};
