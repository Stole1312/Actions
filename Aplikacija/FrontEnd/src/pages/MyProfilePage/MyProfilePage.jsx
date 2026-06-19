export default function MyProfilePage(props){
    return(
        <div>
            <button
                onClick={()=>{props.onLogout()}}
            >Log Out!</button>
        </div>
    )
}