import React, { useCallback, useEffect, useState } from 'react';
import cls from 'classnames';

const PREFIX = 'useEffectView';

interface IProps {
  className?: string;
}

const UseEffectView: React.FC<IProps> = React.memo(function useEffectView(props) {
  const { className } = props;
  const [count, setCount] = useState<number>(0);
  useEffect(() => {
    console.log(count);
    return () => {
      console.log('unmount effect');
    };
  }, [count]);

  const handleClick = useCallback(() => {
    setCount(count + 1);
  }, [count]);
  return (
    <div className={cls(`${PREFIX}`, className)} onClick={handleClick}>
      {count}
    </div>
  );
});

export default UseEffectView;
