<?php

// Settings for `php artisan typescript:transform`, consumed by
// App\Providers\TypeScriptTransformerServiceProvider.

return [

    'directories' => [
        app_path(),
    ],

    'output' => [
        // Mounted at /generated in the backend container; see compose.yaml.
        'directory' => '/generated',
        'file' => 'types.ts',
    ],

];
