<?php

namespace App\Controllers;

// use App\Controllers\BaseController;
use CodeIgniter\HTTP\Response;
use CodeIgniter\HTTP\ResponseInterface;
use Exception;

class Menu extends BaseController
{
    /**
     * Get Menu
     * @return Response
     */
    public function index()
    {
        $menu = [
            [
                "route" => "administration",
                "name" => "Administration",
                "type" => "link",
                "icon" => "poll",
                "children" => [
                    [
                        "route" => "generic-company",
                        "name" => "Generic Company",
                        "type" => "link",
                        "permissions" => [
                            "only" => [],
                            "except" => ["consultant"]
                        ]
                    ],
                    [
                        "route" => "programme",
                        "name" => "Programme",
                        "type" => "link",
                        "permissions" => [
                            "only" => [],
                            "except" => ["consultant"]
                        ]
                    ],
                    [
                        "route" => "business-development",
                        "name" => "Business Development",
                        "type" => "link",
                        "permissions" => [
                            "only" => [],
                            "except" => ["consultant"]
                        ]
                    ],
                    [
                        "route" => "beneficiaries",
                        "name" => "Beneficiaries",
                        "type" => "link",
                        "permissions" => [
                            "only" => [],
                            "except" => ["consultant"]
                        ]
                    ],
                    [
                        "route" => "service-provider",
                        "name" => "Service Provider",
                        "type" => "link",
                        "permissions" => [
                            "only" => [],
                            "except" => ["consultant"]
                        ]
                    ],
                    [
                        "route" => "course",
                        "name" => "Course",
                        "type" => "link",
                        "permissions" => [
                            "only" => [],
                            "except" => ["consultant"]
                        ]
                    ],
                    [
                        "route" => "timesheet",
                        "name" => "Timesheet",
                        "type" => "link"
                    ],
                    [
                        "route" => "timesheet-manager",
                        "name" => "Timesheet Setup",
                        "type" => "link",
                        "permissions" => [
                            "only" => ["admin"],
                            "except" => []
                        ]
                    ],
                    [
                        "route" => "users",
                        "name" => "Users",
                        "type" => "link",
                        "permissions" => [
                            "only" => ["admin"],
                            "except" => []
                        ]
                    ]
                ],
                // Open to all roles: consultants need Timesheet. Each child carries its own rule.
                "permissions" => [
                    "only" => [],
                    "except" => []
                ]
            ],
            // [
            //     "route" => "assessment",
            //     "name" => "Assessment",
            //     "type" => "link",
            //     "icon" => "assessment",
            //     "children"  => [
            //         [
            //             "route" => "event",
            //             "name" => "Event",
            //             "type" => "link"
            //         ],
            //         [
            //             "route" => "form",
            //             "name" => "Assessment",
            //             "type" => "link"
            //         ],
            //         [
            //             "route" => "outcome",
            //             "name" => "Outcomes",
            //             "type" => "link"
            //         ]
            //     ],
            //     "permissions" => [
            //         "only" => [
            //         "ADMIN"
            //         ],
            //         "except" => ""
            //     ]
            // ],
            [
                "route" => "support",
                "name" => "Business Support",
                "type" => "link",
                "icon" => "how_to_reg",
                "children"  => [
                    [
                        "route" => "coaching",
                        "name" => "Coaching",
                        "type" => "link"
                    ],
                    // [
                    //     "route" => "#",
                    //     "name" => "Equipment Support",
                    //     "type" => "link"
                    // ],
                    // [
                    //     "route" => "#",
                    //     "name" => "Finacial Support",
                    //     "type" => "link"
                    // ],
                    [
                        "route" => "mentorship",
                        "name" => "Mentorship",
                        "type" => "link"
                    ],
                    // [
                    //     "route" => "#",
                    //     "name" => "Market Linkage",
                    //     "type" => "link"
                    // ],
                    [
                        "route" => "training",
                        "name" => "Training",
                        "type" => "link"
                    ],
                    // [
                    //     "route" => "#",
                    //     "name" => "Networking Event",
                    //     "type" => "link"
                    // ],
                    // [
                    //     "route" => "#",
                    //     "name" => "Professional Service",
                    //     "type" => "link"
                    // ]
                ],
                "permissions" => [
                    "only" => [],
                    "except" => ["consultant"]
                ]
            ],
            // [
            //     "route" => "permissions",
            //     "name" => "Permissions",
            //     "type" => "sub",
            //     "icon" => "lock",
            //     "children" => [
            //         [
            //             "route" => "role-switching",
            //             "name" => "role-switching",
            //             "type" => "link",
            //             "permissions" => [
            //             "except" => "",
            //             "only" => ""
            //             ]
            //         ],
            //         [
            //             "route" => "route-guard",
            //             "name" => "route-guard",
            //             "type" => "link",
            //             "permissions" => [
            //             "except" => "GUEST",
            //             "only" => ""
            //             ]
            //         ]
            //     ],
            //     "permissions" => [
            //     "only" => "ADMIN",
            //     "except" => ""
            //     ]
            // ],

        ];

        // Role comes from the user record (not the token) so a role change applies on the next load
        $user = getLoggedInUser(getJWTFromRequest($this->request->getServer('HTTP_AUTHORIZATION')));
        $roles = array_filter([strtolower((string) ($user['role'] ?? ''))]);

        return $this->getResponse(
            [
                'message' => 'User menu retrieved',
                'data' => $this->filterMenuByPermissions($menu, $roles)
            ]
        );
    }

    private function filterMenuByPermissions(array $menu, array $userRoles): array
    {
        $filteredMenu = [];

        foreach ($menu as $item) {
            // Check if the user has permission to access this menu item
            if ($this->hasPermission($item, $userRoles)) {
                // Recursively filter children if they exist
                if (!empty($item['children'])) {
                    $item['children'] = $this->filterMenuByPermissions($item['children'], $userRoles);
                    if (empty($item['children'])) {
                        continue; // hide a section whose children are all hidden
                    }
                }
                $filteredMenu[] = $item;
            }
        }

        return $filteredMenu;
    }

    function hasPermission(array $item, array $userRoles): bool
    {
        $permissions = $item['permissions'] ?? [];

        // Check "only" roles (if specified)
        if (!empty($permissions['only'])) {
            if (!array_intersect($permissions['only'], $userRoles)) {
                return false;
            }
        }

        // Check "except" roles (if specified)
        if (!empty($permissions['except'])) {
            if (array_intersect($permissions['except'], $userRoles)) {
                return false;
            }
        }

        return true;
    }
}
