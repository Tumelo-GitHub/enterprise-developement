<?php

namespace App\Models;

use CodeIgniter\Model;

class ServiceProviderRatingModel extends Model
{
    protected $table = 'service_provider_ratings';
    protected $primaryKey = 'id';
    protected $returnType = 'array';
    protected $useTimestamps = true;
    protected $createdField = 'created_at';
    protected $updatedField = 'updated_at';
    protected $allowedFields = [
        'service_provider_id',
        'focus_area',
        'rating',
        'comment',
        'rated_by'
    ];

    public function findByProviderId(int $providerId): array
    {
        return $this
            ->where('service_provider_id', $providerId)
            ->orderBy('created_at', 'DESC')
            ->findAll();
    }

    /**
     * Average rating and total count for a single provider, used so a single
     * picky reviewer can't skew the picture shown alongside the raw feedback list.
     */
    public function getSummaryForProvider(int $providerId): array
    {
        $result = $this
            ->selectAvg('rating', 'average_rating')
            ->selectCount('id', 'rating_count')
            ->where('service_provider_id', $providerId)
            ->first();

        return [
            'average_rating' => $result['average_rating'] !== null ? round((float) $result['average_rating'], 1) : null,
            'rating_count' => (int) ($result['rating_count'] ?? 0)
        ];
    }

    public function getSummaryForAllProviders(): array
    {
        $rows = $this
            ->select('service_provider_id')
            ->selectAvg('rating', 'average_rating')
            ->selectCount('id', 'rating_count')
            ->groupBy('service_provider_id')
            ->findAll();

        $summary = [];
        foreach ($rows as $row) {
            $summary[(int) $row['service_provider_id']] = [
                'average_rating' => round((float) $row['average_rating'], 1),
                'rating_count' => (int) $row['rating_count']
            ];
        }

        return $summary;
    }
}
