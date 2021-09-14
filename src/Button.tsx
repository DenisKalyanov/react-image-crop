import "./style.scss";

const Button: React.FC<any> = (props: any): JSX.Element => {
  const { completedCrop, title, func } = props;

  return (
    <>
      <button
        className="crop-button crop-input-button"
        disabled={!completedCrop?.width || !completedCrop?.height}
        onClick={() => func()}
      >
        {title}
      </button>
    </>
  );
};

export default Button;
