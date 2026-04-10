import { useContext } from 'react';
import HistoryList from '../components/history/HistoryList';
import { AppContext } from '../context/AppContext';

const HistoryPage = () => {
  const { history } = useContext(AppContext);

  return (
    <div className="stack-gap-lg">
      <div className="page-header">
        <h1>History and Audit Trail</h1>
      </div>
      <HistoryList items={history} />
    </div>
  );
};

export default HistoryPage;
