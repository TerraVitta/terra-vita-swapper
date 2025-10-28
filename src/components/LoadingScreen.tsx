import { useEffect, useState } from "react";

export const LoadingScreen = ({ onComplete }: { onComplete: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-background z-50 flex items-center justify-center">
      <div className="loader">
        <div className="tars">
          <div className="container-1">
            <div className="shape">
              <div className="f"></div>
              <div className="b"></div>
              <div className="l"></div>
              <div className="r"></div>
              <div className="t"></div>
              <div className="bot"></div>
            </div>
          </div>
          <div className="container-2">
            <div className="shape">
              <div className="f"></div>
              <div className="b"></div>
              <div className="l"></div>
              <div className="r"></div>
              <div className="t"></div>
              <div className="bot"></div>
            </div>
          </div>
          <div className="container-3">
            <div className="shape">
              <div className="f"></div>
              <div className="b"></div>
              <div className="l"></div>
              <div className="r"></div>
              <div className="t"></div>
              <div className="bot"></div>
            </div>
          </div>
          <div className="container-4">
            <div className="shape">
              <div className="f"></div>
              <div className="b"></div>
              <div className="l"></div>
              <div className="r"></div>
              <div className="t"></div>
              <div className="bot"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
