import { AppQueryProvider } from './providers/appQueryProvider';
import { JobsDashboard } from '@/features/jobs/JobsDashboard';

function App() {
  return (
    <AppQueryProvider>
      <JobsDashboard />
    </AppQueryProvider>
  );
}

export default App;
