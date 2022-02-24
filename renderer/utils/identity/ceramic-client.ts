import Ceramic from '@ceramicnetwork/http-client';
import {IDX} from '@ceramicstudio/idx';
import KeyDidResolver from 'key-did-resolver';
import ThreeIdResolver from '@ceramicnetwork/3id-did-resolver';
import {DID} from 'dids';
import {CERAMIC_CLAY_URL} from '../../constants/identity';

export default class CeramicClient {
  ceramic: Ceramic;
  idx: IDX;
  did: DID;

  getCeramic() {
    if (this.ceramic) return this.ceramic;
    this.ceramic = new Ceramic(CERAMIC_CLAY_URL);
    this.ceramic.did = this.getDid();
    return this.ceramic;
  }

  getDid() {
    if (this.did) return this.did;
    const resolver = {
      ...KeyDidResolver.getResolver(),
      ...ThreeIdResolver.getResolver(this.ceramic),
    };
    this.did = new DID({resolver});
    return this.did;
  }

  getIdx() {
    if (this.idx) return this.idx;
    const ceramic = this.getCeramic();
    this.idx = new IDX({ceramic});
    return this.idx;
  }
}

