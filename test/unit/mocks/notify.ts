import sinon from "sinon";

export default function mockNotify() {
  return {
    notify: sinon.spy(),
    notifyError: sinon.spy(),
  };
}
