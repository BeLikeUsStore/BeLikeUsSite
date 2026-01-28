import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = 'https://bkknrspyjkkbnzrkgvdf.supabase.co';

const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJra25yc3B5amtrYm56cmtndmRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjczODEyMTgsImV4cCI6MjA4Mjk1NzIxOH0.PzzSzUcboSx_8rARXNrVjNZVFWL6oSUVWJbOwPOk084';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);