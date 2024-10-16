import { useEffect, useState } from 'react';
import './App.css';
import { RotatingLines } from 'react-loader-spinner';
import TaskListModal from './TaskListModal';

// Import functions from other files
import {
  connect_to_random_dallas_vpn_server,
  connect_to_random_us_central_vpn_server,
  update_statuses,
  wake_main_pc,
  manage_service,
  restart_pi
} from './pi-control-center';

function App() {
  // Run an update timer, every ten seconds we run the update_statuses function
  const [pi_online, set_pi_online] = useState(false)
  const [pi_vpn_status, set_pi_vpn_status] = useState(null)
  const [pi_vpn_connecting, set_pi_vpn_connecting] = useState(false)
  const [pi_system_status, set_pi_system_status] = useState(null)
  const [qbittorrent_status, set_qbittorrent_status] = useState(null)
  const [main_pc_online, set_main_pc_online] = useState(false)

  // Uptime counters
  const [obelisk_uptime, set_obelisk_uptime] = useState(0)
  const [pi_uptime, set_pi_uptime] = useState(0)

  // Statuses of services
  const [gimme_server_status, set_gimme_server_status] = useState(null)
  const [hyper_server_status, set_hyper_server_status] = useState(null)
  const [cloudflare_tunnels_status, set_cloudflare_tunnels_status] = useState(null)
  const [obelisk_system_status, set_obelisk_system_status] = useState(null)
  const [show_hyper_app_link, set_show_hyper_app_link] = useState(false)
  const [background_enabled, set_background_enabled] = useState(false)
  const [background_url, set_background_url] = useState("")

  useEffect(() => {
    const interval = setInterval(() => {
      update_statuses(set_pi_online, set_pi_vpn_status, set_qbittorrent_status,
        set_main_pc_online, set_gimme_server_status, set_hyper_server_status,
        set_cloudflare_tunnels_status, set_obelisk_system_status, set_obelisk_uptime,
        set_pi_uptime, set_pi_system_status)
    }, 5000)

    // Also create a one second interval for updating the uptime counters
    // We'll use the (prev) => prev + 1 pattern to update the uptime counters
    const uptime_interval = setInterval(() => {
      set_obelisk_uptime((prev) => prev + 1)
      set_pi_uptime((prev) => prev + 1)
    }, 1000)
    update_statuses(set_pi_online, set_pi_vpn_status, set_qbittorrent_status,
      set_main_pc_online, set_gimme_server_status, set_hyper_server_status,
      set_cloudflare_tunnels_status, set_obelisk_system_status, set_obelisk_uptime, set_pi_uptime, set_pi_system_status)
    // Connect journalctl event streams one time
    // We'll use the event source pattern to update the journal logs
    // We'll also use the set state pattern to update the event source
    if (background_enabled) {
      // Fetch the background image from unsplash
      fetch(`https://api.unsplash.com/photos/random?client_id=${import.meta.env.VITE_UNSPLASH_ACCESS_KEY}&orientation=landscape`)
        .then(response => response.json())
        .then(data => {
          console.log(data)
          set_background_url(data.urls.regular)
        });
    }
    return () => {
      clearInterval(interval);
      clearInterval(uptime_interval);
    }
  }, [])


  const convert_seconds_to_nice_string = (seconds) => {
    // Take a number of seconds and turn it into a string like 1d 2h 3m 4s
    const days = Math.floor(seconds / 86400)
    const hours = Math.floor((seconds % 86400) / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const remaining_seconds = seconds % 60
    return `${days}d ${hours}h ${minutes}m ${remaining_seconds}s`
  }


  return (
    <>
      {
        background_enabled && <BackgroundImage background_url={background_url} />
      }
      <h1
        className="Header"
        onClick={() => set_background_enabled(!background_enabled)}
        onContextMenu={(e) => {
          e.preventDefault()
          set_show_hyper_app_link(!show_hyper_app_link)
        }}
      >Obelisk Control Center</h1>
      {/* <div className="ModalColumn">
        <h1>Tasks</h1>
        <TaskListModal />
      </div> */}
      <div className="ModalColumn">
        <h1>Apps</h1>
        <AppModal app_name="Gimme" link="https://gimme.littleobelisk.com" />
        {show_hyper_app_link && <AppModal app_name="Hyper" link="https://hyper.obelisk.local" />}
        <AppModal app_name="Webmin" link="https://webmin.littleobelisk.com" />
        <AppModal app_name="Plex" link="https://plex.littleobelisk.com" />
        <AppModal app_name="Wine" link="https://wine.littleobelisk.com" />
        <h1>Sites</h1>
        {/* Link to ticktick.com/webapp/, Link to Youtube, Link to twitch, Link to Gmail, Link to Chat-gpt, link to Github, link to RocketMoney */}
        <AppModal app_name="TickTick" link="https://ticktick.com/webapp/" />
        <AppModal app_name="Youtube" link="https://www.youtube.com/feed/subscriptions" />
        <AppModal app_name="Twitch" link="https://twitch.tv" />
        <AppModal app_name="Gmail" link="https://mail.google.com" />
        <AppModal app_name="Chat-GPT" link="https://chatgpt.com/" />
        <AppModal app_name="Lichess" link="https://lichess.org" />

      </div>
      {obelisk_system_status && <div className="ModalColumn">
        <h1>Obelisk</h1>
        <div className="ModalRow">
          <InfoModal title="Status" text="Online" online_status="online" />
          <InfoModal title="Uptime" text={convert_seconds_to_nice_string(obelisk_uptime)} />
          <ResourceModal title="CPU Usage" resource={obelisk_system_status.cpu_usage} />
          <ResourceModal title="Memory Usage" resource={obelisk_system_status.memory_usage} />
        </div>
        <DisksModal disks={obelisk_system_status.disk_usage} />
        {gimme_server_status && <ServiceModal title="Gimme Service Status" service={gimme_server_status} />}
        {hyper_server_status && <ServiceModal title="Hyper Service Status" service={hyper_server_status} />}
        {cloudflare_tunnels_status && <ServiceModal title="Cloudflare Tunnels Status" service={cloudflare_tunnels_status} />}
        <ActionModal title="Reboot Obelisk" action={restart_pi} show_loading={false} />
      </div>}
      <div className="ModalColumn">
        <h1>Pi 4</h1>
        <div className="ModalRow">
          <InfoModal title="Status" text={pi_online ? "Online" : "Offline"} online_status={pi_online ? "online" : "offline"} />
          <InfoModal title="Uptime" text={convert_seconds_to_nice_string(pi_uptime)} />
          <ResourceModal title="CPU Usage" resource={pi_system_status ? pi_system_status.cpu_usage : 0} />
          <ResourceModal title="Memory Usage" resource={pi_system_status ? pi_system_status.memory_usage : 0} />
        </div>
        {qbittorrent_status && <InfoModal title="QBitTorrent Status" text={qbittorrent_status.downloading.length > 0 ? "Torrenting" : "Waiting"} online_status={qbittorrent_status ? "online" : "offline"} />}
        {qbittorrent_status && (qbittorrent_status.downloading.length > 0 || qbittorrent_status.queued.length > 0) && <QBitTorrentModal torrents={qbittorrent_status} />}
        <InfoModal title="VPN Status" text={pi_vpn_status} online_status={pi_vpn_status != null ? "online" : pi_vpn_status == "Connecting" ? "offline" : "offline"} />
        <ActionModal title="Reconnect VPN / Random Dallas" action={() => {
          connect_to_random_dallas_vpn_server(set_pi_vpn_connecting)
        }} show_loading={pi_vpn_connecting} disabled={pi_vpn_status == null} />
        <ActionModal title="Reconnect VPN / Random US Central" action={() => {
          connect_to_random_us_central_vpn_server(set_pi_vpn_connecting)
        }} show_loading={pi_vpn_connecting} disabled={pi_vpn_status == null} />
        <ActionModal title="Reboot Pi" action={restart_pi} show_loading={false} />
      </div>
      <div className="ModalColumn">
        <h1>Main PC</h1>
        <InfoModal title="Status" text={main_pc_online ? "Online" : "Offline"} online_status={main_pc_online ? "online" : "offline"} />
        <ActionModal title="Wake" action={wake_main_pc} show_loading={false} />
      </div>
    </>
  )
}

function BackgroundImage({ background_url }) {
  return (
    <div className="BackgroundImage"
      style={{ backgroundImage: `url(${background_url})` }}>
      {/* Backdrop filter blur overlay */}
      <div className="BackgroundOverlay"></div>


    </div>
  )
}


// This modal gets an array of disks, with the name {device}, mountpoint, total space {total}, used space {used}, and free space {free}
// Let's make a nice bar for each disk to represent this data
function DisksModal({ disks }) {
  const convert_bytes_to_largest_unit = (bytes) => {
    // So we have a number of bytes, if its more than 1 Terabyte, the the amount in terabytes to the nearest hundredth, if its less than that and More than 1 Gigabyte, then the amount in gigabytes to the nearest hundredth, and if its less than that, then the amount in megabytes to the nearest hundredth and so on down to bytes
    if (bytes > 1024 * 1024 * 1024 * 1024) {
      return `${Math.round(bytes / 1024 / 1024 / 1024 / 1024 * 100) / 100} TB `
    } else if (bytes > 1024 * 1024 * 1024) {
      return `${Math.round(bytes / 1024 / 1024 / 1024 * 100) / 100} GB `
    } else if (bytes > 1024 * 1024) {
      return `${Math.round(bytes / 1024 / 1024 * 100) / 100} MB `
    } else if (bytes > 1024) {
      return `${Math.round(bytes / 1024 * 100) / 100} KB `
    } else {
      return `${bytes} B`
    }
  }
  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Disks</h2>
        {disks.map((disk) => (
          <div key={disk.device}>
            <p>{disk.mountpoint == "/" ? "OS Drive" : disk.mountpoint.replaceAll("/mnt/", "").replaceAll("Storage", " Storage")}</p>
            <div className="DiskBar">
              <div className={"DiskBarFill" + ((disk.used / disk.total * 100) > 95 ? " RedFill" : "")} style={{ width: `${disk.used / disk.total * 100}%` }}></div>
            </div>
            {/* As these data points are in bytes, lets turn them into gigs for better readability */}
            <p>{
              convert_bytes_to_largest_unit(disk.free)
            }Free / {
                convert_bytes_to_largest_unit(disk.total)
              }Total</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// Resource modal is a modal that shows the title and the resource, which is a string
// This should be able to handle CPU Usage and Memory Usage, an object that will have the decimal representing it's usage
// We'll use the same Diskbar and DiskBarFill pattern from above, but we'll use the percentages from CPU usage and Memory Usage
function ResourceModal({ title, resource }) {
  return (
    <div className="modal ResourceModal">
      <div className="modal-content">
        <h2>{title}</h2>
        <p>{Math.round(resource)}%</p>
        <div className="ResourceModalBar">
          <div className={"ResourceModalBarFill" + (resource > 80 ? " RedFill" : "")} style={{ width: `${resource}%` }}></div>
        </div>
      </div>
    </div>
  )
}


function ServiceModal({ title, service }) {
  // Similar to an Info Modal, but it has an expand functionality that will show the output field of the given service, which is already in the correct format
  // Each service object has a status attribute which will be 'active' or 'inactive', and an output attribute which will be the output of the journalctl command
  const [expanded, setExpanded] = useState(false)
  return (
    <div className={"modal ServiceModal" + (expanded ? " expanded" : "")}>
      {service.status == "active" ? <div className="glowing-dot"></div> : <div className="glowing-dot red"></div>}
      <div className="modal-content">
        <h2>{title}</h2>
        <p
          style={{ textTransform: 'capitalize' }}
        >{service.status}</p>
        {/* Buttons for Starting, Stopping, and Restarting the Service */}
        {/* Use the manage service function, passing the service name and action */}
        <button onClick={() => manage_service(service.name, 'start')}>Start</button>
        <button onClick={() => manage_service(service.name, 'stop')}>Stop</button>
        <button onClick={() => manage_service(service.name, 'restart')}>Restart</button>
        {/* Button to expand the output */}
        <button onClick={() => setExpanded(!expanded)}>{expanded ? "Hide Journal" : "Show Journal"}</button>
        {/* The output text are should auto scroll to the bottom, to get the newest messages, and should also take up the full width of the modal and be somewhat tall */}
        {/* Make not user resizable as well */}
        {expanded ? <><br /><br /><textarea
          className="OutputTextArea"
          value={service.output}
          style={{ resize: 'none' }}
          // Whenever the output changes, scroll to the bottom
          onChange={(e) => e.target.scrollTop = e.target.scrollHeight}
          // Also scroll to the bottom when its mounted
          ref={(el) => el && (el.scrollTop = el.scrollHeight)}

          disabled={true}></textarea></> : null}

      </div>

    </div>
  )
}

function ActionModal({ title, action, show_loading, disabled }) {
  // The action modal where the entire element is a button
  if (show_loading) {
    return (
      <div className="modal ActionModal Loading">
        <RotatingLines
          visible={true}
          height="96"
          width="96"
          color="grey"
          strokeWidth="5"
          animationDuration="0.75"
          ariaLabel="rotating-lines-loading"
          wrapperStyle={{}}
          wrapperClass=""
        />
      </div>
    )
  }
  return (
    <div className={"modal ActionModal" + (disabled ? " disabled" : "")} onClick={action}>
      <p>{title}</p>
    </div>
  )
}

function InfoModal({ title, text, online_status }) {
  return (
    <div className="modal InfoModal">
      {!online_status ? null : (online_status == "online" ? <div className="glowing-dot"></div> : <div className="glowing-dot red"></div>)}
      <div className="modal-content">
        <h2>{title}</h2>
        <p>{text}</p>
      </div>
    </div>
  )
}

function AppModal({ app_name, link, app_icon }) {
  // Make sure link opens in new tab
  return (
    <a href={link}
      target="_blank"
      className="modal AppModal">
      {app_icon ? <img className='AppIcon' src={app_icon} alt={app_name} /> : null}
      <div className="modal-content">
        <h2>{app_name}</h2>
      </div>
    </a>
  )
}

function QBitTorrentModal({ torrents }) {
  // Get largest torrent speed function
  // We get a torrent dl speed in bytes, and convert it to the largest whole unit

  const convert_bytes_to_largest_unit = (bytes) => {
    // So we have a number of bytes, if its more than 1 Terabyte, the the amount in terabytes to the nearest hundredth, if its less than that and More than 1 Gigabyte, then the amount in gigabytes to the nearest hundredth, and if its less than that, then the amount in megabytes to the nearest hundredth and so on down to bytes
    if (bytes > 1024 * 1024 * 1024 * 1024) {
      return `${Math.round(bytes / 1024 / 1024 / 1024 / 1024 * 100) / 100} TB`
    } else if (bytes > 1024 * 1024 * 1024) {
      return `${Math.round(bytes / 1024 / 1024 / 1024 * 100) / 100} GB`
    } else if (bytes > 1024 * 1024) {
      return `${Math.round(bytes / 1024 / 1024 * 100) / 100} MB`
    } else if (bytes > 1024) {
      return `${Math.round(bytes / 1024 * 100) / 100} KB`
    } else {
      return `${bytes} B`
    }
  }

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Torrents</h2>
        <p>Downloading</p>
        <ul>
          {torrents.downloading.map((torrent) => (
            // Torrent.progress is a decimal, turn it into a percentage
            <li key={torrent.name}>
              <p>{torrent.name}: {
                Math.round(torrent.progress * 100)
              }%
              </p>
              {/* If there's a dlspeed attribute, it will be in bytes, and we should convert it to MB */}
              {torrent.dl_speed ? ` ${convert_bytes_to_largest_unit(torrent.dl_speed)}/s` : null}
            </li>
          ))}
          {torrents.downloading.length == 0 ? <li>No Torrents Downloading</li> : null}
        </ul>
        <p>Queued</p>
        <ul>
          {torrents.queued.map((torrent) => (
            <li key={torrent.name}><p>{torrent.name}</p></li>
          ))}
          {torrents.queued.length == 0 ? <li>No Torrents Queued</li> : null}
        </ul>
      </div>
    </div>
  )
}

export default App
