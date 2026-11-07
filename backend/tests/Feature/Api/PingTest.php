<?php

it('answers the ping', function () {
    $this->getJson('/api/ping')->assertOk()->assertJson(['ok' => true]);
});
