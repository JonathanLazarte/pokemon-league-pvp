import './header.css';
import '../playButton/playButton.css';
import PlayButton from '../playButton/playButton.jsx';
import { useState, memo, useRef } from 'react';
import { GiDoubled, GiDividedSquare } from 'react-icons/gi';
import { useSelector, useDispatch } from 'react-redux';
import { RiSidebarFoldFill } from 'react-icons/ri';
import { selectUserInterfaceData, setActualSection } from '../../redux/slices/userInterfaceSlice.js';

export const ToolTip = () => {
  const [windowPosition, setWindowPosition] = useState({ x: 0, y: 0, width: 0 });
  const [showWindow, setShowWindow] = useState(false);
  const [textInElement, setTextInElement] = useState('');
  const timeoutId = useRef(null);

  const ToolTipElement = () => {
    return showWindow ? (
      <div
        style={{
          position: 'fixed',
          left: windowPosition.x - windowPosition.width * 1.5,
          top: windowPosition.y,
          width: windowPosition.width * 4,
          display: 'flex',
          justifyContent: 'center',
          overflow: 'visible',
        }}
      >
        <div className="header-tooltip">{textInElement}</div>
      </div>
    ) : null;
  };

  const handleToolTip = (e, text) => {
    if (timeoutId.current) {
      clearTimeout(timeoutId.current);
    }
    const rect = e.target.getBoundingClientRect();
    timeoutId.current = setTimeout(() => {
      setWindowPosition({ x: rect.left, y: rect.top + rect.height + 20, width: rect.width });
      setTextInElement(text);
      setShowWindow(true);
    }, 550);
  };

  const offToolTip = () => {
    setShowWindow(false);
    if (timeoutId.current) {
      clearTimeout(timeoutId.current);
      timeoutId.current = null;
    }
  };

  return { ToolTipElement, handleToolTip, offToolTip };
};

export default memo(function Header({ showSideNav, setShowSideNav }) {
  const user = useSelector((state) => state.user);
  const { ToolTipElement, handleToolTip, offToolTip } = ToolTip();
  const selectedStyle = {
    background: 'linear-gradient(rgba(25, 0, 0, 1.0), var(--gold-seven))',
    color: '#F0E6D2',
  };
  const dispatch = useDispatch();
  const { actualSection, userState } = useSelector(selectUserInterfaceData);

  const playClickSound = () => {
    const clickSound = new Audio('/general/menu-click.mp3');
    clickSound.play().catch(() => {});
  };

  return (
    <>
      <header
        style={{
          marginRight: !showSideNav ? '0px' : null,
          marginTop:
            userState === 'In explore match' || userState === 'In normal match' ? '-110px' : '0px',
        }}
        className="index-header"
      >
        <ToolTipElement />
        <PlayButton type="header" text="JUEGA" />
        <div className="header-sections">
          <div
            onMouseLeave={offToolTip}
            onMouseEnter={(e) => handleToolTip(e, 'Mochila')}
            style={actualSection === 'Bag' ? selectedStyle : null}
            onClick={() => {
              playClickSound();
              dispatch(setActualSection('Bag'));
            }}
            className="item"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 48 48">
              <defs>
                <mask id="ipSMallBag0">
                  <g fill="none" strokeLinejoin="round" strokeWidth="4">
                    <path fill="#fff" stroke="#fff" d="M6 12.6V41a2 2 0 0 0 2 2h32a2 2 0 0 0 2-2V12.6z" />
                    <path stroke="#fff" strokeLinecap="round" d="M42 12.6L36.333 5H11.667L6 12.6v0" />
                    <path stroke="#000" strokeLinecap="round" d="M31.555 19.2c0 4.198-3.382 7.6-7.555 7.6s-7.556-3.402-7.556-7.6" />
                  </g>
                </mask>
              </defs>
              <path fill="currentColor" d="M0 0h48v48H0z" mask="url(#ipSMallBag0)" />
            </svg>
          </div>
          <div className="icon-separator"></div>

          <div
            onMouseLeave={offToolTip}
            onMouseEnter={(e) => handleToolTip(e, 'Tienda')}
            style={actualSection === 'Store' ? selectedStyle : null}
            onClick={() => {
              playClickSound();
              dispatch(setActualSection('Store'));
            }}
            className="item"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 26 26">
              <path fill="currentColor" d="M18 .188c-4.315 0-7.813 1.929-7.813 4.312S13.686 8.813 18 8.813c4.315 0 7.813-1.93 7.813-4.313S22.314.187 18 .187zm7.813 5.593c-.002 2.383-3.498 4.313-7.813 4.313c-4.303 0-7.793-1.909-7.813-4.281V7.5c0 1.018.652 1.95 1.72 2.688c1.08.294 2.042.702 2.843 1.218c.993.252 2.085.406 3.25.406c4.315 0 7.813-1.929 7.813-4.312zm0 3c0 2.383-3.498 4.313-7.813 4.313c-.525 0-1.035-.039-1.531-.094a4.35 4.35 0 0 1 .781 1.781c.249.014.495.031.75.031c4.315 0 7.813-1.929 7.813-4.312zM8 11.187c-4.315 0-7.813 1.93-7.813 4.313S3.686 19.813 8 19.813c4.315 0 7.813-1.93 7.813-4.313S12.314 11.187 8 11.187m17.813.594c-.002 2.383-3.498 4.313-7.813 4.313c-.251 0-.505-.018-.75-.032c-.011.075-.017.175-.031.25c.05.151.093.3.093.47v1c.227.011.455.03.688.03c4.315 0 7.813-1.929 7.813-4.312zm0 3c-.002 2.383-3.498 4.313-7.813 4.313c-.251 0-.505-.018-.75-.032c-.011.075-.017.175-.031.25c.05.15.093.3.093.47v1c.227.011.455.03.688.03c4.315 0 7.813-1.929 7.813-4.312zm-10 2c-.002 2.383-3.498 4.313-7.813 4.313c-4.303 0-7.793-1.909-7.813-4.282V18.5c0 2.383 3.497 4.313 7.813 4.313s7.813-1.93 7.813-4.313zm0 3c-.002 2.383-3.498 4.313-7.813 4.313c-4.303 0-7.793-1.909-7.813-4.282V21.5c0 2.383 3.497 4.313 7.813 4.313s7.813-1.93 7.813-4.313z" />
            </svg>
          </div>
          <div className="icon-separator"></div>

          <div className="account-coins">
            <div
              onMouseLeave={offToolTip}
              onMouseEnter={(e) => handleToolTip(e, `${user.RP} RP`)}
              className="riot-points"
            >
              <GiDividedSquare color="#d8ad00" fontSize="1.1em" />
              <div className="RP">{user.RP}</div>
            </div>
            <div
              onMouseLeave={offToolTip}
              onMouseEnter={(e) => handleToolTip(e, `${user.BE} Escencias azules`)}
              className="blue-essences"
            >
              <GiDoubled color="0ACBE6" fontSize="1.1em" />
              <div className="BE">{user.BE / 1000} K</div>
            </div>
          </div>
          <div
            onClick={() => setShowSideNav(true)}
            className="item"
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              display: showSideNav ? 'none' : 'flex',
            }}
          >
            <RiSidebarFoldFill />
          </div>
        </div>
      </header>
    </>
  );
});