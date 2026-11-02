<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class CSVViewTest extends TestCase
{
    public function test_page_loads_in_indonesian_without_database_access(): void
    {
        DB::shouldReceive('connection')->never();

        $this->get('/')
            ->assertOk()
            ->assertSee('<html lang="id">', false)
            ->assertSee('<h1 id="page-title">Baca File CSV dengan Mudah.</h1>', false)
            ->assertSee('Pilih File CSV')
            ->assertSee('Pemisah kolom')
            ->assertSee('Cari data')
            ->assertSee('Sebelumnya')
            ->assertSee('Berikutnya')
            ->assertSee('Data tidak diunggah, disimpan, atau dikirim ke layanan lain.');
    }

    public function test_no_csv_upload_endpoint_is_available(): void
    {
        $this->post('/')->assertStatus(405);
    }
}
