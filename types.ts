
export interface UserConfig {
  instances: string[];
  timeZone: string;
  apiKey: string;
}

export interface ReportDefinition {
  id: string;
  name: string;
  reportId: string;
  configurationCode: string;
  dateFormat: 'datetime' | 'date';
  getFilters: (config: UserConfig, dateRangeStr: string) => any;
  outputs: string;
}

export interface DateRange {
  startDate: string;
  endDate: string;
  label: string;
}

export enum Tab {
  GENERATOR = 'GENERATOR',
  HELP = 'HELP',
}
