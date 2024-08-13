export const update_statuses = (
    set_pi_online,
    set_pi_vpn_status,
    set_qbittorrent_status,
    set_main_pc_online,
    set_gimme_server_online,
    set_hyper_server_online,
    set_cloudflare_tunnels_online,
    set_obelisk_system_status,
    set_obelisk_uptime,
    set_pi_uptime,
    set_pi_system_status
) => {
    console.log("Updating statuses")
    check_pi_status(set_pi_online, set_pi_uptime, set_pi_system_status)
    check_pi_vpn_status(set_pi_vpn_status)
    check_qbittorrent_status(set_qbittorrent_status)
    check_main_pc_status(set_main_pc_online)
    check_obelisk_services_status(set_gimme_server_online, set_hyper_server_online, set_cloudflare_tunnels_online)
    check_obelisk_system_status(set_obelisk_system_status, set_obelisk_uptime)
}

export const check_pi_status = (set_pi_online, set_pi_uptime, set_pi_system_status) => {
    // Use fetch to call 192.168.1.144:8000/status
    fetch(`${import.meta.env.VITE_PI_SERVER_URL}/`)
        .then(response => response.json())
        .then(data => {
            console.log(data)
            if (data.status === "OK") {
                set_pi_online(true)
            } else {
                set_pi_online(false)
            }
            set_pi_system_status(data)
            console.log("Setting pi uptime to " + data.uptime)
            set_pi_uptime(data.uptime)
        })
};

export const check_pi_vpn_status = (set_pi_vpn_status) => {
    // Same url but use the /vpn_status endpoint, get the url from the env PI_SERVER_URL
    fetch(`${import.meta.env.VITE_PI_SERVER_URL}/vpn_status`)
        .then(response => response.json())
        .then(data => {
            console.log(data);
            set_pi_vpn_status(data.output)
        })
};

export const connect_to_random_dallas_vpn_server = (set_pi_vpn_connecting) => {
    set_pi_vpn_connecting(true)
    // call the /connect_random endpoint, then print the output
    fetch(`${import.meta.env.VITE_PI_SERVER_URL}/connect_random_dallas`)
        .then(response => response.json())
        .then(data => {
            console.log(data);
            set_pi_vpn_connecting(false)
            check_pi_vpn_status()
        })
}

// Same as above, but to connect to random US Central Server
export const connect_to_random_us_central_vpn_server = (set_pi_vpn_connecting) => {
    set_pi_vpn_connecting(true)
    fetch(`${import.meta.env.VITE_PI_SERVER_URL}/connect_random_us_central`)
        .then(response => response.json())
        .then(data => {
            console.log(data);
            set_pi_vpn_connecting(false)
            check_pi_vpn_status()
        })
}

export const check_qbittorrent_status = (set_qbittorrent_status) => {
    fetch(`${import.meta.env.VITE_PI_SERVER_URL}/qbittorrent_status`)
        .then(response => response.json())
        .then(data => {
            console.log(data);
            // If there's no downloading
            set_qbittorrent_status(data)
        })
}

export const restart_pi = () => {
    // Just call the /restart endpoint
    fetch(`${import.meta.env.VITE_PI_SERVER_URL}/restart`)
        .then(response => response.json())
        .then(data => {
            console.log(data);
        })
}

export const wake_main_pc = () => {
    // Just call the /wake_main_pc endpoint
    fetch(`${import.meta.env.VITE_PI_SERVER_URL}/wake_main_pc`)
        .then(response => response.json())
        .then(data => {
            console.log(data);
        })
}

export const check_main_pc_status = (set_main_pc_online) => {
    // Call the /ping_main_pc endpoint
    fetch(`${import.meta.env.VITE_PI_SERVER_URL}/ping_main_pc`)
        .then(response => response.json())
        .then(data => {
            console.log(data);
            if (data.status === "online") {
                set_main_pc_online(true)
            } else {
                set_main_pc_online(false)
            }
        })
}

export const check_obelisk_services_status = (set_gimme_server_status, set_hyper_server_status, set_cloudflare_tunnels_status) => {
    // Call the /ping_gimme, /ping_hyper, and /ping_cloudflare_tunnels endpoints
    fetch(`${import.meta.env.VITE_OBELISK_SERVER_URL}/services`)
        .then(response => response.json())
        .then(data => {
            console.log(data);
            set_gimme_server_status(data.gimme_server)
            set_hyper_server_status(data.hyper_server)
            set_cloudflare_tunnels_status(data.cloudflare_tunnels)
        })
}

export const manage_service = (service_name, action) => {
    // Call the /start_service endpoint with the service_name
    fetch(`${import.meta.env.VITE_OBELISK_SERVER_URL}/services/${action}/${service_name}`)
        .then(response => response.json())
        .then(data => {
            console.log(data);
        })
}

export const check_obelisk_system_status = (set_obelisk_system_status, set_obelisk_uptime) => {
    // Call the /system_status endpoint
    fetch(`${import.meta.env.VITE_OBELISK_SERVER_URL}/system`)
        .then(response => response.json())
        .then(data => {
            console.log(data);
            set_obelisk_system_status(data)
            console.log("Setting obelisk uptime to " + data.uptime)
            set_obelisk_uptime(data.uptime)
        })
}

export const restart_obelisk_system = () => {
    // Call the /restart_system endpoint
    fetch(`${import.meta.env.VITE_OBELISK_SERVER_URL}/restart`)
        .then(response => response.json())
        .then(data => {
            console.log(data);
        })
}
