import React from 'react';
import cls from 'classnames';
import './index.less';
import { Controlled, UnControlled, IControlledCodeMirror } from 'react-codemirror2';

import 'codemirror/addon/fold/foldcode.js'; // 代码折叠
import 'codemirror/addon/fold/foldgutter.js'; // 代码折叠
import 'codemirror/addon/fold/brace-fold.js'; // 代码折叠
import 'codemirror/addon/fold/comment-fold.js'; // 代码折叠
import 'codemirror/addon/hint/javascript-hint.js'; // 自动提示
import 'codemirror/addon/hint/show-hint.js'; // 自动提示
import 'codemirror/addon/lint/lint.js'; // 错误校验
import 'codemirror/addon/lint/javascript-lint.js'; // js错误校验
import 'codemirror/addon/selection/active-line.js'; // 当前行高亮
import 'codemirror/lib/codemirror.js';
import 'codemirror/mode/javascript/javascript.js';
//css
import 'codemirror/addon/fold/foldgutter.css'; // 代码折叠
import 'codemirror/addon/hint/show-hint.css'; // 自动提示
import 'codemirror/addon/lint/lint.css'; // 代码错误提示
import 'codemirror/lib/codemirror.css'; // 编辑器样式
// import 'codemirror/theme/idea.css'; // 主题: idea
import 'codemirror/theme/material.css';
import 'codemirror/theme/solarized.css';
const PREFIX = 'Code';

interface IProps extends Omit<IControlledCodeMirror, 'onBeforeChange'> {
  className?: string;
  value: string;
  options?: any;
  scrollToBottomWhenChange?: boolean;
  controlled?: boolean;
  onBeforeChange?: (editor: any, data: any, value: string) => void;
}

const Code: React.FC<IProps> = React.memo(function Error(props) {
  const {
    className,
    value,
    options = {},
    onBeforeChange,
    scrollToBottomWhenChange,
    controlled = true,
  } = props;

  const handleChange = (editor: any, data: any, value: string) => {
    onBeforeChange?.(editor, data, value);
    if (scrollToBottomWhenChange) {
      setTimeout(() => {
        editor.scrollIntoView({ line: editor.lastLine(), char: 0 }, 100);
      }, 100);
    }
  };

  if (controlled) {
    return (
      <div className={cls(`${PREFIX}`, className)}>
        <Controlled
          className={`${PREFIX}-edit`}
          value={value}
          onBeforeChange={handleChange}
          options={{
            extraKeys: {
              //配置按键
              Alt: 'autocomplete', // 按下`alt`时出现代码提示
            },
            lineNumbers: true, // 显示行号
            lineWrapping: false, // 自动换行
            mode: 'javascript',
            theme: 'material',
            matchBrackets: true, // 匹配括号
            gutters: ['CodeMirror-lint-markers'],
            lint: true, // 代码出错提醒
            indentUnit: 4, // 缩进配置（默认为2）
            ...options,
          }}
        />
      </div>
    );
  } else {
    return (
      <div className={cls(`${PREFIX}`, className)}>
        <UnControlled
          className={`${PREFIX}-edit`}
          value={value}
          onBeforeChange={handleChange}
          options={{
            extraKeys: {
              //配置按键
              Alt: 'autocomplete', // 按下`alt`时出现代码提示
            },
            lineNumbers: true, // 显示行号
            lineWrapping: false, // 自动换行
            mode: 'javascript',
            theme: 'material',
            matchBrackets: true, // 匹配括号
            gutters: ['CodeMirror-lint-markers'],
            lint: true, // 代码出错提醒
            indentUnit: 4, // 缩进配置（默认为2）
            ...options,
          }}
        />
      </div>
    );
  }
});

export default Code;
