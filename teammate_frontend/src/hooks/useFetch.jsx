import { useEffect, useState } from 'react';

const useFetch = (fetcher, deps = []) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;

    const run = async () => {
      try {
        setLoading(true);
        const result = await fetcher();
        if (active) {
          setData(result?.data ?? []);
        }
      } catch (err) {
        if (active) {
          setError(err.message || 'Something went wrong');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    run();

    return () => {
      active = false;
    };
  }, deps);

  return { data, loading, error, setData };
};

export default useFetch;
