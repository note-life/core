const randomstring = () => Math.random().toString(36).slice(2);

const TOKEN_SECRET = () => randomstring() + randomstring();

export default TOKEN_SECRET;