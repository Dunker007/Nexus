import fs from 'fs/promises';
import path from 'path';
import os from 'os';

const BASE_DIR = path.join(os.homedir(), 'Documents', 'DLX_Projects');

export async function ensureBaseDir() {
    try {
        await fs.access(BASE_DIR);
    } catch {
        await fs.mkdir(BASE_DIR, { recursive: true });
    }
}

export async function listProjects() {
    await ensureBaseDir();
    return fs.readdir(BASE_DIR);
}

export async function createProject(name: string) {
    await ensureBaseDir();
    const projectPath = path.join(BASE_DIR, name);
    await fs.mkdir(projectPath, { recursive: true });
    return projectPath;
}

export async function writeAsset(projectName: string, fileName: string, content: string) {
    await ensureBaseDir();
    const filePath = path.join(BASE_DIR, projectName, fileName);
    await fs.writeFile(filePath, content, 'utf-8');
    return filePath;
}
