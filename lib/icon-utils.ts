/**
 * Utility for mapping technology names to Simple Icons slugs and brand colors.
 */

export const ICON_METADATA: Record<string, { slug: string; color: string }> = {
    // Security Tools
    'wireshark': { slug: 'wireshark', color: '1679A7' },
    'metasploit': { slug: 'metasploit', color: '246EB9' },
    'burp suite': { slug: 'burpsuite', color: 'FF6633' },
    'splunk': { slug: 'splunk', color: '000000' },
    'kali linux': { slug: 'kalilinux', color: '557C94' },
    'nmap': { slug: 'nmap', color: 'A8B9CC' },
    'nessus': { slug: 'nessus', color: '003F59' },
    'snort': { slug: 'snort', color: 'DE0029' },
    'palo alto': { slug: 'paloaltonetworks', color: 'F04E23' },
    'fortinet': { slug: 'fortinet', color: 'EE3224' },
    'crowdstrike': { slug: 'crowdstrike', color: 'ED1C24' },
    'sentinelone': { slug: 'sentinelone', color: '000000' },
    'wi-fi': { slug: 'wi-fi', color: '000000' },
    'checkpoint': { slug: 'checkpoint', color: 'DD1122' },
    'tenable': { slug: 'tenable', color: '003F59' },
    'owasp': { slug: 'owasp', color: 'FFFFFF' },

    // Programming & Dev
    'python': { slug: 'python', color: '3776AB' },
    'bash': { slug: 'gnubash', color: '4EAA25' },
    'powershell': { slug: 'powershell', color: '5391FE' },
    'javascript': { slug: 'javascript', color: 'F7DF1E' },
    'typescript': { slug: 'typescript', color: '3178C6' },
    'git': { slug: 'git', color: 'F05032' },
    'github': { slug: 'github', color: '181717' },
    'sql': { slug: 'sqlite', color: '003B57' },
    'mysql': { slug: 'mysql', color: '4479A1' },
    'postgresql': { slug: 'postgresql', color: '4169E1' },
    'mongodb': { slug: 'mongodb', color: '47A248' },
    'docker': { slug: 'docker', color: '2496ED' },
    'kubernetes': { slug: 'kubernetes', color: '326CE5' },
    'aws': { slug: 'amazonaws', color: '232F3E' },
    'azure': { slug: 'microsoftazure', color: '0078D4' },
    'gcp': { slug: 'googlecloud', color: '4285F4' },
    'linux': { slug: 'linux', color: 'FCC624' },
    'ubuntu': { slug: 'ubuntu', color: 'E95420' },
    'debian': { slug: 'debian', color: 'A81D33' },
    'red hat': { slug: 'redhat', color: 'EE0000' },
    'node.js': { slug: 'nodedotjs', color: '339933' },
    'react': { slug: 'react', color: '61DAFB' },
    'next.js': { slug: 'nextdotjs', color: '000000' },
    'tailwind': { slug: 'tailwindcss', color: '06B6D4' },
    'html': { slug: 'html5', color: 'E34F26' },
    'css': { slug: 'css3', color: '1572B6' },
    'php': { slug: 'php', color: '777BB4' },
    'c++': { slug: 'cplusplus', color: '00599C' },
    'c#': { slug: 'csharp', color: '239120' },
    'java': { slug: 'openjdk', color: '007396' },
    'go': { slug: 'go', color: '00ADD8' },
    'rust': { slug: 'rust', color: '000000' },
};

/**
 * Normalizes a name to try and find a matching brand icon.
 */
export const findBrandIcon = (name: string) => {
    const normalized = name.toLowerCase().trim();

    // 1. Direct match in metadata
    if (ICON_METADATA[normalized]) {
        return ICON_METADATA[normalized];
    }

    // 2. Try slugifying and checking if it's likely a simple icon slug
    const slug = normalized
        .replace(/\+/g, 'plus')
        .replace(/\./g, 'dot')
        .replace(/#/g, 'sharp')
        .replace(/ /g, '')
        .replace(/-/g, '');

    // We can't easily check if it exists on Simple Icons without a fetch,
    // but we can return the slug and let the UI handle the image error.
    return {
        slug,
        color: '666666'
    };
};

/**
 * Metadata for common certification organizations.
 * Maps to Simple Icons slugs for auto logo detection.
 */
export const ORGANIZATION_METADATA: Record<string, { slug: string; color: string }> = {
    // Major Certification Bodies
    'comptia': { slug: 'comptia', color: 'C8202F' },
    'cisco': { slug: 'cisco', color: '1BA0D7' },
    'microsoft': { slug: 'microsoft', color: '5E5E5E' },
    'aws': { slug: 'amazonaws', color: 'FF9900' },
    'amazon': { slug: 'amazonaws', color: 'FF9900' },
    'google': { slug: 'google', color: '4285F4' },
    'ibm': { slug: 'ibm', color: '052FAD' },
    'oracle': { slug: 'oracle', color: 'F80000' },
    'red hat': { slug: 'redhat', color: 'EE0000' },
    'redhat': { slug: 'redhat', color: 'EE0000' },
    'linux foundation': { slug: 'linuxfoundation', color: '003778' },
    'linux': { slug: 'linux', color: 'FCC624' },

    // Security Certifications
    'ec-council': { slug: 'eccouncil', color: '000000' },
    'eccouncil': { slug: 'eccouncil', color: '000000' },
    'offensive security': { slug: 'offsec', color: '000000' },
    'offsec': { slug: 'offsec', color: '000000' },
    '(isc)²': { slug: 'isc2', color: '003F2D' },
    'isc2': { slug: 'isc2', color: '003F2D' },
    'isaca': { slug: 'isaca', color: '3C7EBE' },
    'sans': { slug: 'sans', color: 'E21A23' },
    'giac': { slug: 'giac', color: 'E21A23' },
    'fortinet': { slug: 'fortinet', color: 'EE3124' },
    'splunk': { slug: 'splunk', color: '000000' },
    'crowdstrike': { slug: 'crowdstrike', color: 'ED1C24' },
    'palo alto': { slug: 'paloaltonetworks', color: 'F04E23' },
    'palo alto networks': { slug: 'paloaltonetworks', color: 'F04E23' },
    'checkpoint': { slug: 'checkpoint', color: 'DD1122' },
    'tenable': { slug: 'tenable', color: '003F59' },

    // Cloud & DevOps
    'azure': { slug: 'microsoftazure', color: '0078D4' },
    'kubernetes': { slug: 'kubernetes', color: '326CE5' },
    'docker': { slug: 'docker', color: '2496ED' },
    'hashicorp': { slug: 'hashicorp', color: '000000' },
    'terraform': { slug: 'terraform', color: '7B42BC' },

    // Learning Platforms
    'udemy': { slug: 'udemy', color: 'A435F0' },
    'coursera': { slug: 'coursera', color: '0056D2' },
    'linkedin learning': { slug: 'linkedin', color: '0A66C2' },
    'linkedin': { slug: 'linkedin', color: '0A66C2' },
    'pluralsight': { slug: 'pluralsight', color: 'F15B2A' },
    'edx': { slug: 'edx', color: '02262B' },
    'skillshare': { slug: 'skillshare', color: '00FF84' },
    'tryhackme': { slug: 'tryhackme', color: '212C42' },
    'hackthebox': { slug: 'hackthebox', color: '9FEF00' },
    'hack the box': { slug: 'hackthebox', color: '9FEF00' },

    // Other Tech Companies
    'salesforce': { slug: 'salesforce', color: '00A1E0' },
    'vmware': { slug: 'vmware', color: '607078' },
    'citrix': { slug: 'citrix', color: '452170' },
    'juniper': { slug: 'junipernetworks', color: '84B135' },
    'sophos': { slug: 'sophos', color: '2D67C3' },
};

/**
 * Finds organization icon data from Simple Icons.
 * Similar to findBrandIcon but optimized for certification organizations.
 */
export const findOrganizationIcon = (organization: string) => {
    const normalized = organization.toLowerCase().trim();

    // 1. Direct match in metadata
    if (ORGANIZATION_METADATA[normalized]) {
        return ORGANIZATION_METADATA[normalized];
    }

    // 2. Try partial matching (e.g., "CompTIA Security+" should match "comptia")
    for (const [key, value] of Object.entries(ORGANIZATION_METADATA)) {
        if (normalized.includes(key) || key.includes(normalized)) {
            return value;
        }
    }

    // 3. Try slugifying and return with default color
    const slug = normalized
        .replace(/\+/g, 'plus')
        .replace(/\./g, 'dot')
        .replace(/#/g, 'sharp')
        .replace(/\(/g, '')
        .replace(/\)/g, '')
        .replace(/²/g, '2')
        .replace(/ /g, '')
        .replace(/-/g, '');

    return {
        slug,
        color: '666666'
    };
};
