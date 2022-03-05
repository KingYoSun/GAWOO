import { useCallback, useMemo } from "react";
import { useDropzone } from "react-dropzone";
import { FlexRow } from "./Flex";

const DropZone = ({
  handleDrop,
}: {
  handleDrop: (acceptedFiles: any) => void;
}) => {
  const onDrop = useCallback((acceptedFiles) => handleDrop(acceptedFiles), []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const RootStyle = useMemo(
    () => ({
      backGroundColor: ({ isDragActive, theme }) =>
        isDragActive
          ? theme.palette.primary.light
          : theme.palette.background.default,
    }),
    []
  );

  return (
    <div {...getRootProps({ RootStyle })}>
      <input {...getInputProps} />
      <FlexRow>
        {isDragActive ? <p>ファイルをドロップ</p> : <p>ファイルを選択</p>}
      </FlexRow>
    </div>
  );
};

export default DropZone;
