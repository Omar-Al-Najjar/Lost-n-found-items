import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://supabase.com/dashboard/project/rerzrxqgmfufqrrtifpn/settings/api-keys'
const supabaseKey = 'sb_publishable_4sfl1-GOKSdcYkAVmCy56w_EXdmjHhr'

export const supabase = createClient(supabaseUrl, supabaseKey)