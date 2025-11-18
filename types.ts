export type DataRow = Record<string, string | number | null | undefined>;

export interface SortConfig {
  key: string;
  direction: 'ascending' | 'descending';
}

export interface AnalysisResult {
    dataOverview?: {
        description?: string;
        qualityIssues?: string[];
    };
    keyInsights?: {
        insight?: string;
        supportingData?: string;
    }[];
    potentialAnomalies?: {
        anomaly?: string;
        details?: string;
    }[];
    actionableRecommendations?: string[];
    suggestedVisualizations?: {
        title: string;
        type: 'bar' | 'pie';
        data: { label: string; value: number }[];
    }[];
}

export type ChatMessage = {
  role: 'user' | 'model';
  text: string;
};

export type TodoItem = {
  id: string;
  text: string;
  completed: boolean;
};
