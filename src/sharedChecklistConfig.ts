// This is public browser configuration. Only use a Supabase publishable key.
const url = import.meta.env.VITE_CHECKLIST_URL;
const publishableKey = import.meta.env.VITE_CHECKLIST_PUBLISHABLE_KEY;
const onTravelSite = typeof window !== 'undefined'
  && window.location.origin === 'https://qkqhticyc-lab.github.io'
  && window.location.pathname.startsWith('/hawaii-honeymoon/');

export const sharedChecklistConfig = url && publishableKey ? { url, publishableKey } : onTravelSite ? {
  url: 'https://yotovkfapovldvrfcaea.supabase.co',
  publishableKey: 'sb_publishable_Fq69HuTdPcTr_Pnh9JvC_A_AddqDMEb',
} : null;
