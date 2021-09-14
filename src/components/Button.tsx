import "../styles/style.scss";

const Button: React.FC<any> = (props: any): JSX.Element => (
  <button
    className="crop-button crop-input-button"
    disabled={!props.completedCrop?.width || !props.completedCrop?.height}
    onClick={() => props.func()}
  >
    {props.title}
  </button>
);

export default Button;
