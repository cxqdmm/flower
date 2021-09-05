import React from 'react';
import cls from 'classnames';
import './index.less';
import { Controlled as CodeMirror } from 'react-codemirror2';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/material.css';
import 'codemirror/mode/xml/xml';
import 'codemirror/mode/javascript/javascript';
const PREFIX = 'Error';

interface IProps {
  className?: string;
  error: string;
}

const ErrorView: React.FC<IProps> = React.memo(function Error(props) {
  const { className, error } = props;

  return (
    <div className={cls(`${PREFIX}`, className)}>
      <CodeMirror
        className={`${PREFIX}-edit`}
        value={error}
        onBeforeChange={() => {}}
        options={{
          mode: 'javascript',
          theme: 'material',
          lineNumbers: true,
        }}
      />
    </div>
  );
});

export default ErrorView;
