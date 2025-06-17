import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const TVShowsRedirect = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  useEffect(() => {
    navigate('/tv', { replace: true });
  }, [navigate]);
  
  return null;
};

export default TVShowsRedirect;
