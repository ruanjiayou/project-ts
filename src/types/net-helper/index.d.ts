interface rp {
  (url: string, type: string): rp;
  header(): rp;
  attach(): rp;
  query(): rp;
  send(): rp;
  end(): any;
}

interface shttp {
  get(): rp;
  post(): rp;
  put(): rp;
  delete(): rp;
  patch(): rp;
  getHTML(): any;
}

declare function isOnline(url: string): boolean;