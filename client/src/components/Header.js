import React from 'react';
import { Disclosure } from '@headlessui/react';
import { Link, useLocation } from 'react-router-dom';

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'LogIn', href: '/Login', visibleTo: ['guest'] },
  { name: 'ChatBot', href: '/ChatBot', visibleTo: ['doctor'] },
  { name: 'Reports', href: '/Reports', visibleTo: ['doctor', 'Care Taker'] },
  { name: 'Form', href: '/Form', visibleTo: ['Care Taker'] },
  { name: 'Admin', href: '/Admin', visibleTo: ['admin'] },
  { name: 'Logout', href: '#', visibleTo: ['doctor', 'Care Taker', 'admin'] },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

const Header = ({ handleLogout }) => {
  const location = useLocation();

  // Extract user type from session storage
  const userType = sessionStorage.getItem('userType') || 'guest';

  const filteredNavigation = navigation.filter((item) =>
    (item.visibleTo || []).includes(userType)
  );

  return (
    <div>
      <Disclosure as="nav" className=" top-0 z-50">
        {({ open }) => (
          <>
            <div className="mx-auto max-w-9xl px-2 sm:px-6 lg:px-8" style={{background:'rgba(136, 210, 216, 1)'}}>
              <div className="relative flex h-16 items-center justify-between">
                <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
                  {/* Mobile menu button*/}
                  <Disclosure.Button className="relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
                    <span className="sr-only">Open main menu</span>
                    {open ? (
                      <svg
                        className="block h-6 w-6"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="block h-6 w-6"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 6h16M4 12h16M4 18h16"
                        />
                      </svg>
                    )}
                  </Disclosure.Button>
                </div>
                <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
                  <div className="flex-shrink-0 items-center">
                    <Link
                    key='Home'
                    to='/'
                    > 
                    <img
                      className="h-9 w-auto"
                      src="https://res.cloudinary.com/duwadnxwf/image/upload/v1713351625/logo_lqkj0b.png"
                      alt="Your Company"
                    />
                    </Link>
                  </div>
                  <div className="hidden sm:ml-6 sm:block">
                    <div className="flex space-x-4">
                      {filteredNavigation.map((item) => (
                        <Link
                          key={item.name}
                          to={item.href}
                          className={classNames(
                            item.href === location.pathname
                              ? 'bg-gray-900 text-white'
                              : 'text-base hover:bg-gray-800 hover:text-white',
                            'rounded-md px-3 py-2 text-sm font-medium'
                          )}
                          onClick={item.name === 'Logout' ? handleLogout : null}
                        >
                          {item.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <Disclosure.Panel className="sm:hidden">
              <div className="space-y-1 px-2 pb-3 pt-2">
                {filteredNavigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={classNames(
                      item.href === location.pathname
                        ? 'bg-gray-900 text-white'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                      'block rounded-md px-3 py-2 text-base font-medium'
                    )}
                    aria-current={
                      item.href === location.pathname ? 'page' : undefined
                    }
                    onClick={item.name === 'Logout' ? handleLogout : null}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </Disclosure.Panel>
          </>
        )}
      </Disclosure>
    </div>
  );
};

export default Header;
