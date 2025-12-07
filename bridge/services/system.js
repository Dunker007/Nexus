/**
 * System Metrics Service
 * Collects GPU, CPU, RAM stats via nvidia-smi and OS commands
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export const systemService = {

    /**
     * Get all system metrics
     */
    async getMetrics() {
        const [gpu, cpu, memory] = await Promise.all([
            this.getGPU(),
            this.getCPU(),
            this.getMemory()
        ]);

        return {
            gpu,
            cpu,
            memory,
            timestamp: new Date().toISOString()
        };
    },

    /**
     * Get GPU stats via nvidia-smi
     */
    async getGPU() {
        try {
            const { stdout } = await execAsync(
                'nvidia-smi --query-gpu=name,utilization.gpu,memory.used,memory.total,temperature.gpu,power.draw --format=csv,noheader,nounits'
            );

            const parts = stdout.trim().split(',').map(s => s.trim());

            return {
                available: true,
                name: parts[0],
                utilization: parseFloat(parts[1]) || 0,
                memoryUsed: parseFloat(parts[2]) || 0,      // MB
                memoryTotal: parseFloat(parts[3]) || 0,     // MB
                temperature: parseFloat(parts[4]) || 0,     // Celsius
                powerDraw: parseFloat(parts[5]) || 0,       // Watts
                memoryUsedGB: (parseFloat(parts[2]) / 1024).toFixed(1),
                memoryTotalGB: (parseFloat(parts[3]) / 1024).toFixed(1),
                memoryPercent: ((parseFloat(parts[2]) / parseFloat(parts[3])) * 100).toFixed(1)
            };
        } catch (error) {
            return {
                available: false,
                error: error.message
            };
        }
    },

    /**
     * Get CPU stats via PowerShell
     */
    async getCPU() {
        try {
            // Get CPU usage
            const { stdout: usageOut } = await execAsync(
                'powershell -Command "Get-WmiObject Win32_Processor | Select-Object -ExpandProperty LoadPercentage"'
            );

            // Get CPU name
            const { stdout: nameOut } = await execAsync(
                'powershell -Command "Get-WmiObject Win32_Processor | Select-Object -ExpandProperty Name"'
            );

            // Get core count
            const { stdout: coresOut } = await execAsync(
                'powershell -Command "Get-WmiObject Win32_Processor | Select-Object -ExpandProperty NumberOfCores"'
            );

            return {
                name: nameOut.trim(),
                cores: parseInt(coresOut.trim()) || 0,
                utilization: parseFloat(usageOut.trim()) || 0
            };
        } catch (error) {
            return {
                error: error.message
            };
        }
    },

    /**
     * Get Memory stats via PowerShell
     */
    async getMemory() {
        try {
            const { stdout } = await execAsync(
                'powershell -Command "Get-WmiObject Win32_OperatingSystem | Select-Object TotalVisibleMemorySize,FreePhysicalMemory | ConvertTo-Json"'
            );

            const data = JSON.parse(stdout);
            const totalKB = data.TotalVisibleMemorySize;
            const freeKB = data.FreePhysicalMemory;
            const usedKB = totalKB - freeKB;

            return {
                totalGB: (totalKB / 1024 / 1024).toFixed(1),
                usedGB: (usedKB / 1024 / 1024).toFixed(1),
                freeGB: (freeKB / 1024 / 1024).toFixed(1),
                percentUsed: ((usedKB / totalKB) * 100).toFixed(1)
            };
        } catch (error) {
            return {
                error: error.message
            };
        }
    },

    /**
     * Get disk usage for a specific drive
     */
    async getDisk(drive = 'C:') {
        try {
            const { stdout } = await execAsync(
                `powershell -Command "Get-WmiObject Win32_LogicalDisk -Filter \\"DeviceID='${drive}'\\" | Select-Object Size,FreeSpace | ConvertTo-Json"`
            );

            const data = JSON.parse(stdout);
            const totalBytes = data.Size;
            const freeBytes = data.FreeSpace;
            const usedBytes = totalBytes - freeBytes;

            return {
                drive,
                totalGB: (totalBytes / 1024 / 1024 / 1024).toFixed(1),
                usedGB: (usedBytes / 1024 / 1024 / 1024).toFixed(1),
                freeGB: (freeBytes / 1024 / 1024 / 1024).toFixed(1),
                percentUsed: ((usedBytes / totalBytes) * 100).toFixed(1)
            };
        } catch (error) {
            return {
                error: error.message
            };
        }
    }
};
