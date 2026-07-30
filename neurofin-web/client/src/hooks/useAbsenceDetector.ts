import { useEffect, useState } from 'react';
import { useAnalyticsStore } from '@/stores/useAnalyticsStore';

/**
 * Hook que detecta se o usuário está ausente há mais de 14 dias.
 * Retorna dados de ausência para renderizar o ForgivenessModal.
 */
export function useAbsenceDetector() {
  const { lastActivity, fetchLastActivity } = useAnalyticsStore();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const check = async () => {
      await fetchLastActivity();
      setChecked(true);
    };
    check();
  }, [fetchLastActivity]);

  return {
    isAbsent: checked && lastActivity?.isAbsent === true,
    daysSince: lastActivity?.daysSinceLastLogin ?? 0,
    lastLoginAt: lastActivity?.lastLoginAt ?? null,
    isChecked: checked,
  };
}
