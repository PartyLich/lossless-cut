// @flow
export type FSA<Payload> = {|
  type: string,
  payload?: Payload,
  error?: boolean,
  meta?: mixed
|}

export type TypedFSA<Type, Payload> = {|
  type: Type,
  payload?: Payload,
  error?: boolean,
  meta?: mixed
|}
