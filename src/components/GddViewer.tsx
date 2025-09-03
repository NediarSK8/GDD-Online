import { useState, useEffect } from 'react';
import { GddData } from '../types';

const GddViewer = () => {
  const [gdd, setGdd] = useState<GddData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}gdd.json`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Erro na rede: ' + response.statusText);
        }
        return response.json();
      })
      .then((data) => {
        setGdd(data);
        setLoading(false);
      })
      .catch((error) => {
        setError(error.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div>Carregando...</div>;
  }

  if (error) {
    return <div>Erro ao carregar o GDD: {error}</div>;
  }

  if (!gdd) {
    return <div>Nenhum GDD encontrado.</div>;
  }

  return (
    <main>
      <h1>{gdd.gameTitle}</h1>
      <p><strong>Logline:</strong> {gdd.logline}</p>
      
      <h2>Mecânicas Principais</h2>
      {gdd.coreMechanics.map((mechanic, index) => (
        <div key={index}>
          <h3>{mechanic.name}</h3>
          <p>{mechanic.description}</p>
        </div>
      ))}

      <h2>Público-Alvo</h2>
      <p>{gdd.targetAudience}</p>
    </main>
  );
};

export default GddViewer;
