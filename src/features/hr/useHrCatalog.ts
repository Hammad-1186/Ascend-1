import { useEffect, useState } from 'react';
import { hrService } from './hrService';
import type { HrCatalog } from '../../types/hr';

interface State { catalog: HrCatalog | null; isLoading: boolean; error: Error | null }

/** Themes / labs / projects / dropdown data: { catalog, isLoading, error }. */
export function useHrCatalog(): State {
  const [state, setState] = useState<State>({ catalog: null, isLoading: true, error: null });
  useEffect(() => {
    let live = true;
    hrService.getCatalog()
      .then((catalog) => live && setState({ catalog, isLoading: false, error: null }))
      .catch((error: Error) => live && setState({ catalog: null, isLoading: false, error }));
    return () => { live = false; };
  }, []);
  return state;
}
