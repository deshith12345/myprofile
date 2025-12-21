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
