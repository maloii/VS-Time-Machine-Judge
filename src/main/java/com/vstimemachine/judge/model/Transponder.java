package com.vstimemachine.judge.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import org.hibernate.validator.constraints.UniqueElements;

import javax.persistence.*;
import java.time.LocalDateTime;

@Data
@Entity
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode(of = { "id" })
@Table(
        name="TRANSPONDER",
        uniqueConstraints=
        @UniqueConstraint(columnNames={"COMPETITION_ID", "NUMBER"})
)
public class Transponder {

    @Id
    @GeneratedValue
    private Long id;

    @Version
    @JsonIgnore
    private Long version;
    private LocalDateTime dateCreate = LocalDateTime.now();

    private Integer number;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "sportsman_id")
    private Sportsman sportsman;

    @ManyToOne()
    @JoinColumn(name = "competition_id")
    private Competition competition;

}
