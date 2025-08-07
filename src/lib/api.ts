import { supabase } from '@/integrations/supabase/client';

export const counselingApi = {
  analyze: async (studentData: any, analysisType: string = 'comprehensive') => {
    const response = await supabase.functions.invoke('counseling-ai', {
      body: {
        studentData,
        analysisType
      }
    });

    if (response.error) {
      throw new Error(response.error.message);
    }

    return response.data;
  },

  query: async (studentData: any, query: string) => {
    const response = await supabase.functions.invoke('counseling-ai', {
      body: {
        studentData,
        query
      }
    });

    if (response.error) {
      throw new Error(response.error.message);
    }

    return response.data;
  }
};