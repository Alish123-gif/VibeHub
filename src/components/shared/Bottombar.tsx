import { bottombarLinks } from '@/constants';
import { INavLink } from '@/types';
import { Link, NavLink, useLocation } from 'react-router-dom'

function Bottombar() {
  const { pathname } = useLocation();

  return (
    <section className='bottom-bar'>
      {bottombarLinks.map((link: INavLink) => {
        const isActive = pathname === link.route;
        return (

          <Link
            to={link.route}
            key={link.label}
            className={`${isActive && 'bg-primary-500 rounded-[10px]'} flex-center flex-col gap-1 py-1 px-4 transition`}>

            <img 
            src={link.imgURL} 
            className={`group-hover:invert-white ${isActive && 'invert-white'}`}
            width={22} 
            height={22} 
            />
            <p className='small-medium text-light-2'>{link.label}</p>
          </Link>
        )
      })}
    </section>
  )
}

export default Bottombar