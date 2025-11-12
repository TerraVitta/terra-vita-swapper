export const HourglassLoader = () => {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="hourglassBackground">
        <div className="hourglassContainer">
          <div className="hourglassCapTop"></div>
          <div className="hourglassGlassTop"></div>
          <div className="hourglassGlass"></div>
          <div className="hourglassCapBottom"></div>
          <div className="hourglassSand"></div>
          <div className="hourglassSandStream"></div>
        </div>
      </div>
      <style>{`
        .hourglassBackground {
          position: relative;
          background: hsl(var(--muted));
          height: 130px;
          width: 130px;
          border-radius: 50%;
          margin: 30px auto;
        }
        .hourglassContainer {
          position: absolute;
          top: 30px;
          left: 40px;
          width: 50px;
          height: 70px;
          animation: hourglassRotate 2s ease-in 0s infinite;
          transform-style: preserve-3d;
          perspective: 1000px;
        }
        .hourglassContainer div,
        .hourglassContainer div:before,
        .hourglassContainer div:after {
          transform-style: preserve-3d;
        }
        @keyframes hourglassRotate {
          0% { transform: rotateX(0deg); }
          50% { transform: rotateX(180deg); }
          100% { transform: rotateX(180deg); }
        }
        .hourglassCapTop {
          position: absolute;
          top: 0;
          width: 50px;
          height: 10px;
          background: hsl(var(--primary));
          border-radius: 4px;
        }
        .hourglassCapBottom {
          position: absolute;
          bottom: 0;
          width: 50px;
          height: 10px;
          background: hsl(var(--primary));
          border-radius: 4px;
        }
        .hourglassGlassTop {
          position: absolute;
          width: 44px;
          height: 44px;
          background-color: hsl(var(--accent) / 0.2);
          border: 3px solid hsl(var(--primary));
          border-radius: 50%;
          top: -16px;
          left: 3px;
          transform: rotateX(90deg);
        }
        .hourglassGlass {
          position: absolute;
          width: 10px;
          height: 6px;
          top: 32px;
          left: 20px;
          background-color: hsl(var(--primary) / 0.3);
        }
        .hourglassSand {
          position: absolute;
          width: 0;
          height: 0;
          border-left: 20px solid transparent;
          border-right: 20px solid transparent;
          border-top: 20px solid hsl(var(--accent));
          top: 14px;
          left: 5px;
          animation: sandFall 2s ease-in 0s infinite;
        }
        .hourglassSandStream {
          position: absolute;
          width: 3px;
          height: 0;
          background: hsl(var(--accent));
          top: 32px;
          left: 23.5px;
          animation: stream 2s ease-in 0s infinite;
        }
        @keyframes sandFall {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
        @keyframes stream {
          0%, 45% { height: 0; }
          46%, 50% { height: 10px; }
          51%, 100% { height: 0; }
        }
      `}</style>
    </div>
  );
};
