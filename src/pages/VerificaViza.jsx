// VerificaViza.jsx
'use client';
import { useState, useEffect } from 'react';
import apiClient from '../apiClient';

const CAPTCHA_IMAGES = [
  '/Capture.png',
  '/Cap-1.png',
  '/Cap-2.png',
  '/Cap-3.png',
  '/Cap-4.png',
  '/Cap-5.png',
  '/Cap-6.png',
  '/Cap-7.png',
  '/Cap-8.png',
  '/Cap-9.png',
  '/Cap-10.png',
  '/Cap-11.png',
  '/Cap-12.png'
];

const CAPTCHA_VALUES = {
  '/Capture.png': '63RNR7',
  '/Cap-1.png': '2R9BT6',
  '/Cap-2.png': 'H974TT',
  '/Cap-3.png': 'S2STNT',
  '/Cap-4.png': 'QFJE33',
  '/Cap-5.png': '7E4Z3J',
  '/Cap-6.png': '74DL4G',
  '/Cap-7.png': 'N44UG9',
  '/Cap-8.png': 'QWLQP6',
  '/Cap-9.png': 'R68KPC',
  '/Cap-10.png': 'GBHVDH',
  '/Cap-11.png': 'ZVJKEJ',
  '/Cap-12.png': 'PNG2GT'
};


export default function VerificaViza() {
  const [visaNumber, setVisaNumber] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const [captchaValue, setCaptchaValue] = useState('63RNR7');
  const [captchaImage, setCaptchaImage] = useState(CAPTCHA_IMAGES[0]);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [currentCulture, setCurrentCulture] = useState('ro-RO');

  const formatDate = (value) => {
    if (!value) return '';

    // If we already have a string like dd/MM/yyyy or d/M/yyyy, normalize and return it
    if (typeof value === 'string') {
      const match = value.match(/^(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{4})$/);
      if (match) {
        const day = match[1].padStart(2, '0');
        const month = match[2].padStart(2, '0');
        const year = match[3];
        return `${day}/${month}/${year}`;
      }
    }

    // Fallback: parse as Date (ISO, timestamps, etc.)
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value;
    }

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  };


  useEffect(() => {
    // pick a random captcha image on first load and set its expected value
    const randomIndex = Math.floor(Math.random() * CAPTCHA_IMAGES.length);
    const selectedImage = CAPTCHA_IMAGES[randomIndex];
    setCaptchaImage(selectedImage);
    setCaptchaValue(CAPTCHA_VALUES[selectedImage] || '');

    // Get culture from URL or cookie
    const urlParams = new URLSearchParams(window.location.search);
    const cultureFromUrl = urlParams.get('c');
    
    if (cultureFromUrl) {
      setCurrentCulture(cultureFromUrl);
    } else {
      // Try to get from cookie (simplified - you might want to use a cookie library)
      const cookies = document.cookie.split(';');
      const visaCookie = cookies.find(c => c.trim().startsWith('visaCulture='));
      if (visaCookie) {
        setCurrentCulture(visaCookie.split('=')[1]);
      }
    }
  }, []);

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);

    if (!captchaInput.trim()) {
      setError('Introduceți codul de verificare');
      return;
    }

    // verify captcha locally against the image's expected value
    if (captchaInput.trim().toUpperCase() !== captchaValue.toUpperCase()) {
      setError('Cod de verificare incorect');
      return;
    }

    if (!visaNumber.trim()) {
      setError('Introduceți numărul vizei');
      return;
    }

    try {
      // Real API call - searches by visa number only
      const response = await apiClient.post('/visa/verify', {
        visaNumber: visaNumber.trim(),
        captchaInput: captchaInput.trim()
      });

      const data = response.data;

      if (data.success) {
        setResult(data);
        setShowResult(true);
      } else {
        setError(data.message || 'Viza nu a fost găsită');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'A apărut o eroare. Vă rugăm încercați din nou.');
    }
  };

  const handleReloadCaptcha = () => {
    const randomIndex = Math.floor(Math.random() * CAPTCHA_IMAGES.length);
    const selectedImage = CAPTCHA_IMAGES[randomIndex];
    setCaptchaImage(selectedImage);
    setCaptchaValue(CAPTCHA_VALUES[selectedImage] || '');
    setCaptchaInput('');
  };

  const handleNewSearch = () => {
    setVisaNumber('');
    setCaptchaInput('');
    setResult(null);
    setShowResult(false);
    setError('');
  };

  return (
    <div className="verifica-viza-page">
      Verifica viza
      <div id="header-wrapper">
        <div id="header-emblem">
          <a id="header-title" href="#">
            <span>
              MINISTERUL AFACERILOR EXTERNE SI INTEGRARII EUROPENE AL REPUBLICII MOLDOVA
            </span>
          </a>
        </div>

        <div id="header-right">
          <span>
            <img src="/eVisa.png" width="187" height="79" alt="eVisa logo" className='mb-[4px]'/>
          </span>
          <div className="">
            <a href="?c=ro-RO" className="langRO mr-[4px]">&nbsp;</a>
            <a href="?c=en-US" className="langEN-passive">&nbsp;</a>
          </div>
        </div>

        <ul id="horizontal-menu" className="sf-menu">
          <li className="menu-item-level1 col1 menu-color5">
            <a href="./Home/Index">Start</a>
          </li>
          <li className="menu-item-level1 col2 menu-color1">
            <a href="http://www.mfa.gov.md/vize-intrare-rm/cetatenii-straini-nevoie/" target="_blank" rel="noopener noreferrer">
              Am nevoie de viza?
            </a>
          </li>
          <li className="menu-item-level1 col3 menu-color2">
            <a href="./VisaFile/Inregistrare">Aplica acum</a>
          </li>
          <li className="menu-item-level1 col4 menu-color3">
            <a href="./VisaFile/Continua">Continua aplicarea</a>
          </li>
          <li className="menu-item-level1 col5 menu-color4">
            <a href="./VisaFile/Verifica">Verifica status</a>
          </li>
          <li className="menu-item-level1 col6 menu-color5">
            <a href="./check-my-visa/">Verifica viza</a>
          </li>
        </ul>
      </div>

      <div id="body-wrapper" className="inner">
        <div id="sidebar">
          <div className="sidebar-item">
            Informații suplimentare
            <a href="/Info/ThingsYouShouldKnow?c=ro-RO" className='text-xm text-left'>
              10 lucruri pe care trebuie sa le cunoşti despre serviciul eVisa
            </a>
          </div>
        </div>

        <div id="content">
          <div className="page-title-content"></div>

          {error && (
            <div id="form_error_message" className="pageErrorMessage" style={{ display: 'block' }}>
              {error}
            </div>
          )}

          <div id="masterMainContent">
            {!showResult ? (
              <form id="formVerificaViza" onSubmit={handleVerify}>
                <fieldset className="app-panel">
                  <div className="app-left-panel">Viza cautata</div>
                  <div className="app-content-panel">
                    <div className="content-left">
                      <div className="app-content-data">
                        <label htmlFor="NumarViza">
                          Numărul documentului de călătorie sau numărul de referință
                        </label>
                        <input
                          type="text"
                          id="NumarViza"
                          name="NumarViza"
                          value={visaNumber}
                          onChange={(e) => setVisaNumber(e.target.value)}
                        />
                      </div>
                     

                      <div className="app-content-data">
                        <br></br>
                        <img
                          id="CaptchaImage"
                          src={captchaImage}
                          alt="Captcha"
                        />
                        <input
                          id="CaptchaDeText"
                          name="CaptchaDeText"
                          type="hidden"
                          value={captchaValue}
                        />
                        
                        <a
                          className='underline text-blue-600'
                          href="#CaptchaImage"
                          
                          onClick={(e) => {
                            e.preventDefault();
                            handleReloadCaptcha();
                          }}
                        >
                          Reîncarcă
                        </a>
                        <br />
                        Cod de verificare
                        <br />
                        <input
                          autoComplete="off"
                          autoCorrect="off"
                          id="CaptchaInputText"
                          name="CaptchaInputText"
                          type="text"
                          value={captchaInput}
                          onChange={(e) => setCaptchaInput(e.target.value)}
                        />
                        <br />
                      </div>

                      <div className="app-content-data">
                        <button type="submit">Verifica</button>
                      </div>
                    </div>
                    <div className="content-right"></div>
                  </div>
                </fieldset>
              </form>
            ) : (
              <div id="rezVerificaViza" style={{ display: 'block' }}>
                <fieldset className="app-panel">
                  <div className="app-left-panel">Viza cautata</div>
                  <div className="app-content-panel">
                    <div style={{ display: 'flex', gap: '10px', margin: '10px', marginRight: '50px' }}>
                      <div id="divFotografie" style={{ flexShrink: 0 }}>
                        <img
                          id="imgFotografie"
                          alt="Fotografie posesor viză"
                          src={result?.UriFotografie}
                          style={{
                            width: '120px',
                            height: '120px',
                            border: '1px solid #333',
                            objectFit: 'cover',
                            display: result?.UriFotografie ? 'block' : 'none'
                          }}
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'block';
                          }}
                        />
                        <div
                          id="placeholderFotografie"
                          style={{
                            width: '120px',
                            height: '120px',
                            border: '1px solid #333',
                            backgroundColor: '#f5f5f5',
                            display: result?.UriFotografie ? 'none' : 'block'
                          }}
                        >
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: '100%',
                            padding: '5px',
                            boxSizing: 'border-box'
                          }}>
                            <span style={{
                              color: '#666',
                              fontSize: '14px',
                              textAlign: 'center',
                              lineHeight: '1.3',
                              wordWrap: 'break-word',
                              display: 'block'
                            }}>
                              Photo not found
                            </span>
                          </div>
                        </div>
                      </div>

                      <div style={{ fontSize: '14px', lineHeight: '1.8' }}>
                        <div>Nume: <strong>{result?.NumeSolicitant}</strong></div>
                        <div>Prenume: <strong>{result?.PrenumeSolicitant}</strong></div>
                        <div>Data nasterii: <strong>{formatDate(result?.DataNastereSolicitant)}</strong></div>
                        <div>Cetatenie: <strong>{result?.DenumireCetatenie}</strong></div>
                        <div>Numar pasaport: <strong>{result?.NumarPasaport}</strong></div>
                      </div>
                    </div>

                    <div style={{ fontSize: '14px', lineHeight: '1.8', margin: '10px' }}>
                      <div>
                        <span style={{ color: 'red' }}>Status viză: </span>
                        <strong style={{ color: 'red' }}>{result?.DenumireStatus}</strong>
                      </div>
                      <div>Valabilitatea vizei: <strong>{formatDate(result?.ValabilitateStop)}</strong></div>
                      <div>Tip viza: <strong>{result?.CodTipViza}</strong></div>
                      <div>Scopul vizitei: <strong>{result?.DenumireScopVizita}</strong></div>
                    </div>

                    <div style={{ textAlign: 'center', margin: '0 10px 10px 10px' }}>
                      <button type="button" onClick={handleNewSearch}>
                        Alta cautare
                      </button>
                    </div>
                  </div>
                </fieldset>
              </div>
            )}
          </div>
        </div>
      </div>

      <div id="footer-wrapper">
        <span style={{ color: 'LightGray' }}>Version: 1.6.1.0</span>
        <table id="contact-info">
          <tbody>
            <tr>
              <td style={{ width: '210px' }}>&nbsp;</td>
              <td><strong>E-mail:</strong></td>
              <td><a className='text-blue-600 underline' href="mailto:evisa@mfa.gov.md">evisa@mfa.gov.md</a></td>
            </tr>
          </tbody>
        </table>
      </div>

      <form id="__AjaxAntiForgeryForm" action="#" method="post" style={{ display: 'none' }}>
        <input
          name="__RequestVerificationToken"
          type="hidden"
          value="1BV0UeCmBMPsE2CeqZkaXaHTrzKxlm-ACtCRF5_ED4qmwE1M0ekFUD0djY8lomgQKLkrkfei2MSz7h0WL1SbaimB5CQ-dvcBr7Ehd81O4dYoYYMBv01fGAAPlP3uasgsLXFKmsHSlwX4xfgzRJo3S-bZ508Y9lEKvvmdVLbb2mA1"
        />
      </form>
    </div>
  );
}