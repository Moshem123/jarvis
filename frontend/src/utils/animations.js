import { keyframes } from 'styled-components';

// Loader animations
export const rotate = keyframes`
    0% {transform: rotate(0deg);}
	100% {transform: rotate(360deg);}
`;
export const rotateRev = keyframes`
    0% {transform: rotate(0deg);}
    100% {transform: rotate(-360deg);}
`;
export const pulse = keyframes`
	0% {
        transform: scale(0.1);
        opacity: 0.2;
    }
	50% {
        transform: scale(1);
        opacity: 0.8;
    }
  100% {
        transform: scale(0.1);
        opacity: 0.2;
    }
`;

// Blink
export const blinker = keyframes`
    from {
        opacity: 1;
    }
    to {
        opacity: 0;
    }
`;

// Modal
export const slideInDown = keyframes`
    from {
        transform: translate3d(0, -100%, 0);
        opacity: 0;
    }

    to {
        transform: translate3d(0, 0, 0);
    }
`;

export const slideOutUp = keyframes`
    from {
      transform: translate3d(0, 0, 0);
      opacity: 1;
    }
    
    to {
      transform: translate3d(0, -100%, 0);
      opacity: 0;
    }
`;