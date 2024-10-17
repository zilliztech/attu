import { useTheme } from '@mui/material';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { vs2015, github } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { GraphNode } from '../../types';

const DataPanel = (props: { node: GraphNode; color: any }) => {
  // theme
  const theme = useTheme();
  // props
  const { node, color } = props;
  const data = node.data;

  // format data to json
  const json = JSON.stringify(data, null, 2);
  const image = ['https://randomuser.me/api/portraits/men/40.jpg'];

  // loop through the object find any value is an image url, add it into an image array;
  for (const key in data) {
    if (
      typeof data[key] === 'string' &&
      data[key].match(/\.(jpeg|jpg|gif|png)$/) != null
    ) {
      image.push(data[key]);
    }
  }

  const styleObj = node.nodeY
    ? {
        top: node.nodeY + 16,
        left: node.nodeX! + 16,
        right: 'auto',
        position: 'absolute',
        borderColor: color(node.color + ''),
      }
    : { borderColor: color(node.color + '') };

  return (
    <div key={node.id} className="nodeInfo" style={styleObj as any}>
      <div className="wrapper">
        {image.map((url, i) => (
          <a key={i} href={url} target="_blank">
            <img src={url} />
          </a>
        ))}
      </div>
      <SyntaxHighlighter
        language="json"
        style={theme.palette.mode === 'dark' ? vs2015 : github}
        customStyle={{ fontSize: 11, margin: 0 }}
        showLineNumbers={false}
      >
        {json}
      </SyntaxHighlighter>
    </div>
  );
};

export default DataPanel;
