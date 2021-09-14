import "../styles/style.scss";

const RadioButton: React.FC<any> = (props: any): JSX.Element => (
  <label className="crop-label">
    <input type="radio" name={props.name} onChange={props.func} />
    {props.title}
  </label>
);

export default RadioButton;
