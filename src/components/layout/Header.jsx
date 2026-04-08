import Icon from '../ui/Icon'

export default function Header({ right }) {
  return (
    <div className="hdr">
      <div>
        <div className="hdr-brand">Your Home</div>
        <div className="hdr-sub">· Conciergerie</div>
      </div>
      <div className="hdr-r">
        <button className="hbtn"><Icon name="globe" size={15}/></button>
        <button className="hbtn">
          <Icon name="bell" size={15}/>
          <span className="hnotif"/>
        </button>
        {right ?? <button className="hbtn"><Icon name="user" size={15}/></button>}
      </div>
    </div>
  )
}
