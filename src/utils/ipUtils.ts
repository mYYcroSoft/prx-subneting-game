
export const generateRandomIPAddress = (): string => {
    const octets = Array.from({ length: 4 }, () => Math.floor(Math.random() * 256));
    return octets.join('.');
};


export const generateRandomSubnetMask = (): number => {
    return Math.floor(Math.random() * 23) + 8;
};

export const subnetMaskToCIDR = (mask: string): number => {
    const octets = mask.split('.');
    let count = 0;
    for (const octet of octets) {
        const binary = parseInt(octet).toString(2);
        count += binary.split('1').length - 1;
    }
    return count;
};

export const CIDRToSubnetMask = (cidr: number): string => {
    const mask = '1'.repeat(cidr) + '0'.repeat(32 - cidr);
    const octets = [];
    for (let i = 0; i < 32; i += 8) {
        octets.push(parseInt(mask.slice(i, i + 8), 2));
    }
    return octets.join('.');
};

export const calculateNetworkAddress = (ip: string, cidr: number): string => {
    const ipOctets = ip.split('.').map(Number);
    const maskOctets = CIDRToSubnetMask(cidr).split('.').map(Number);
    const networkOctets = ipOctets.map((octet, index) => octet & maskOctets[index]);
    return networkOctets.join('.');
};

export const calculateBroadcastAddress = (ip: string, cidr: number): string => {
    const ipOctets = ip.split('.').map(Number);
    const maskOctets = CIDRToSubnetMask(cidr).split('.').map(Number);
    const broadcastOctets = ipOctets.map((octet, index) => 
        octet | (~maskOctets[index] & 255)
    );
    return broadcastOctets.join('.');
};

export const calculateUsableHosts = (cidr: number): number => {
    return Math.pow(2, 32 - cidr) - 2;
};

export const isValidIPAddress = (ip: string): boolean => {
    const octets = ip.split('.');
    if (octets.length !== 4) return false;
    
    return octets.every(octet => {
        const num = parseInt(octet);
        return num >= 0 && num <= 255 && !isNaN(num);
    });
};
export const isValidSubnetMask = (mask: string): boolean => {
    const octets = mask.split('.');
    if (octets.length !== 4) return false;
    
    const binary = octets
        .map(octet => parseInt(octet).toString(2).padStart(8, '0'))
        .join('');
    
    return /^1+0+$/.test(binary);
};