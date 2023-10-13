export function render(str) {
  //reduce your information or text
  const truncate = (input) =>
    input?.length > 200 ? `${input.substring(0, 197)}...` : input;

  return (
    <div>
      {truncate(str)}
    </div>
  );
}