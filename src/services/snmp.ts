import snmp from 'net-snmp';

export interface SNMPMetrics {
  bandwidth_in: number;
  bandwidth_out: number;
  interface: string;
}

export class SNMPService {
  private session: snmp.Session;
  private readonly oids = {
    ifInOctets: '1.3.6.1.2.1.2.2.1.10',    // Incoming traffic
    ifOutOctets: '1.3.6.1.2.1.2.2.1.16',   // Outgoing traffic
    ifName: '1.3.6.1.2.1.31.1.1.1.1',      // Interface name
  };

  constructor(host: string, community = 'public') {
    this.session = snmp.createSession(host, community);
  }

  async getInterfaceMetrics(interfaceIndex: number): Promise<SNMPMetrics> {
    const oids = [
      `${this.oids.ifInOctets}.${interfaceIndex}`,
      `${this.oids.ifOutOctets}.${interfaceIndex}`,
      `${this.oids.ifName}.${interfaceIndex}`,
    ];

    return new Promise((resolve, reject) => {
      this.session.get(oids, (error, varbinds) => {
        if (error) {
          reject(error);
          return;
        }

        // Check for errors in varbinds
        for (const varbind of varbinds) {
          if (snmp.isVarbindError(varbind)) {
            reject(new Error(`Error getting OID ${varbind.oid}`));
            return;
          }
        }

        resolve({
          bandwidth_in: Number(varbinds[0].value),
          bandwidth_out: Number(varbinds[1].value),
          interface: varbinds[2].value.toString(),
        });
      });
    });
  }

  close() {
    this.session.close();
  }
}
