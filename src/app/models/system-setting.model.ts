export interface SystemSetting {
    settingId?: number;
    settingKey: string;
    settingValue: string;
    description?: string;
    dataType?: string;     // STRING, NUMBER, BOOLEAN
    isEditable?: boolean;
    createdAt?: string;
    updatedAt?: string;
}