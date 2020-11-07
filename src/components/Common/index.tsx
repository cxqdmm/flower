import styled from 'styled-components';
import React, { useCallback, useState } from 'react';
export const Scene = styled.div`
  background-color: #f4f9fe;
  padding: 16px 20px 0 20px;
  margin: 10px 0;
`;

export const Panel = styled.div`
  border: 1px solid #e6ecf1;
  padding: 16px 20px;
  margin: 10px 0;
`;

export const H3 = styled.div`
  font-size: 16px;
  margin-bottom: 8px;
  font-weight: 600;
`;
export const H2 = styled.div`
  font-size: 20px;
  margin-bottom: 8px;
  font-weight: 600;
`;
export const H1 = styled.div`
  font-size: 24px;
  margin-bottom: 8px;
  font-weight: 600;
`;
export const Button = styled.div`
  font-size: 12px;
  background-color: #e6ecf1;
  padding: 4px 8px;
  cursor: pointer;
  line-height: 12px;
  font-weight: 600;
  user-select: none;
`;
const Conclusion: React.FC = React.memo(function Conclusion(props) {
  const { children } = props;
  const [visible, setVisible] = useState<boolean>(false);
  const handleOpen = useCallback(() => {
    setVisible((prev) => !prev);
  }, []);
  return (
    <div style={{ position: 'relative', borderTop: '2px solid #e6ecf1', padding: '10px' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          height: '20px',
          textAlign: 'right',
          fontSize: '12px',
          lineHeight: '20px',
        }}
        onClick={handleOpen}
      >
        <H3>结论</H3>

        <Button>{visible ? '收起' : '展开'}</Button>
      </div>
      {visible && <div style={{ padding: '16px 20px' }}>{children}</div>}
    </div>
  );
});

export default Conclusion;
